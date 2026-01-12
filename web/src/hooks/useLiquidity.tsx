import config from "@/config";
import { EVENTS, track } from "@/utils/analytics";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAllowanceCheck } from "./useAllowanceCheck";
import { MaxUint256 } from "ethers";

import { adaptViemWallet, getClient } from "@reservoir0x/relay-sdk";
import RelayTxToaster from "@/components/relayTxToaster";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import { createWalletClient, custom, encodeFunctionData, parseUnits } from "viem";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import useConnectWallet from "./useConnectWallet";
import { usePublicClient, useWriteContract } from "wagmi";
import tradingAbi from "@/config/abi/trading";

interface AddInput {
  amount: number;
  fromToken: string;
  fromChain: number;
  toToken: string;
  toChain: number;
  fromDecimals?: number;
}
type TradeType = "EXACT_INPUT" | "EXACT_OUTPUT" | "EXPECTED_OUTPUT";

export default function useLiquidity({
  tradingAddr,
  campaignId,
}: {
  tradingAddr: `0x${string}`;
  campaignId: `0x${string}`;
}) {
  const queryClient = useQueryClient();
  const account = useAppKitAccount();
  const { connect } = useConnectWallet();
  const { walletProvider } = useAppKitProvider("eip155");
  const { checkAndAprove } = useAllowanceCheck();
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const publicClient = usePublicClient();
  const { mutateAsync: writeContract } = useWriteContract()
  const tradingContract = {
    address: tradingAddr as `0x${string}`,
    abi: tradingAbi
  } as const
  const addLiquidityTx = (amount: bigint, simulatedShare?: bigint) => {
    const minShares = simulatedShare
      ? (simulatedShare * BigInt(95)) / BigInt(100)
      : BigInt(0);
    const maxShares = simulatedShare
      ? (simulatedShare * BigInt(105)) / BigInt(100)
      : MaxUint256;
    return {
      ...config.contracts.buyHelper2,
      functionName: "addLiquidity",
      args: [
        tradingAddr,
        config.NEXT_PUBLIC_FUSDC_ADDR as `0x${string}`,
        amount,
        account.address as `0x${string}`,
        minShares,
        maxShares,
        BigInt(0),
        [],
        BigInt(Math.floor(Date.now() / 1000) + 60 * 60),
      ],
    } as const;
  };
  const add = async (fusdc: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) return connect();
          if (!publicClient) throw new Error("Public client is not set");
          const amount = parseUnits(fusdc, config.contracts.decimals.shares);
          await checkAndAprove({
            contractAddress: config.contracts.fusdc.address,
            spenderAddress: config.contracts.buyHelper2.address,
            address: account.address,
            amount,
          });
          await checkAndSwitchChain();

          const simulation = await publicClient.simulateContract(addLiquidityTx(amount));

          await writeContract(addLiquidityTx(amount, simulation.result.liq));

          queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId],
          });
          queryClient.invalidateQueries({
            queryKey: ["userLiquidity", account.address, tradingAddr],
          });
          track(EVENTS.ADD_LIQUIDITY, {
            amount,
            type: "addLiquidity",
            tradingAddr,
            campaignId,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Adding liquidity...",
        success: "Liquidity added successfully!",
        error: "Failed to add.",
      },
    );
  const addWithRelay = async (
    input: AddInput,
    fromDecimals?: number,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) return connect();
          if (!fromDecimals) throw new Error("fromDecimals is undefined");
          const fromAmountBigInt = parseUnits(
            input.amount.toString(),
            fromDecimals,
          );
          const toAmountRes = await fetch("https://api.relay.link/quote", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: account?.address,
              originChainId: input.fromChain,
              destinationChainId: input.toChain,
              originCurrency: input.fromToken,
              destinationCurrency: input.toToken,
              recipient: account?.address,
              referrer: "9lives.so",
              amount: fromAmountBigInt.toString(),
              tradeType: "EXACT_INPUT" as TradeType,
            }),
          });
          if (toAmountRes.status !== 200) {
            throw new Error("Selected token is not supported.");
          }
          const toAmountData = await toAmountRes.json();
          const toAmount = toAmountData.details.currencyOut.amount as string;

          const calldata = await encodeFunctionData(addLiquidityTx(BigInt(toAmount)))

          const options = {
            user: account.address,
            chainId: input.fromChain,
            toChainId: input.toChain,
            currency: input.fromToken,
            toCurrency: input.toToken,
            recipient: account.address,
            referrer: "9lives.so",
            amount: toAmount, // Total value of all txs
            tradeType: "EXACT_OUTPUT" as TradeType,
            txs: [
              {
                to: config.contracts.buyHelper2.address,
                value: toAmount, // Must match total amount
                data: calldata,
              },
            ],
          };

          const relayClient = getClient();

          const quote = await relayClient.actions.getQuote(options);

          await checkAndSwitchChain();

          const viemWalletClient = createWalletClient({
            account: account.address as `0x${string}`,
            chain: Object.values(config.chains).find((i) => i.id === input.fromChain),
            transport: custom(walletProvider as any),
          });

          let requestId: string | undefined;
          await relayClient.actions.execute({
            quote,
            wallet: adaptViemWallet(viemWalletClient as any),
            onProgress: ({ currentStep, currentStepItem }) => {
              if (currentStep && currentStepItem) {
                requestId = currentStep?.requestId;
                if (currentStepItem.error) {
                  toast.error(
                    `${currentStep.action}: ${currentStepItem.errorData?.cause?.shortMessage ?? currentStepItem.error}`,
                    { id: requestId },
                  );
                } else if (currentStepItem.checkStatus === "success") {
                  toast.success(currentStep.description, { id: requestId });
                } else {
                  toast.loading(
                    `${currentStep.action}: ${currentStepItem.progressState}`,
                    { id: requestId },
                  );
                }
              }
            },
          });

          if (requestId) {
            toast.custom(
              (t) => (
                <RelayTxToaster
                  tx={requestId!}
                  close={() => toast.dismiss(t.id)}
                />
              ),
              {
                duration: Infinity,
                position: "bottom-right",
              },
            );
          }

          queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId],
          });
          queryClient.invalidateQueries({
            queryKey: ["userLiquidity", account.address, tradingAddr],
          });
          track(EVENTS.ADD_LIQUIDITY, {
            fromAmount: input.amount,
            toAmount: toAmount,
            type: "addLiquidityWithRelay",
            tradingAddr,
            campaignId,
            fromChain: input.fromChain,
            fromToken: input.fromToken,
            fromDecimals,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Adding liquidity...",
        success: "Liquidity added successfully!",
        error: "Failed to add.",
      },
    );
  const remove = async (
    fusdc: string,
    totalLiquidity: number,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) return connect()
          const _fusdc = parseUnits(fusdc, config.contracts.decimals.shares);
          const diff = BigInt(totalLiquidity) - _fusdc;
          const amount =
            BigInt(1e6) > diff ? BigInt(totalLiquidity) - BigInt(1e6) : _fusdc; // always 1 usdc should be secured in liquidity pool
          await checkAndSwitchChain();
          await writeContract({
            ...tradingContract,
            functionName: "removeLiquidity3C857A15",
            args: [amount, account.address as `0x${string}`]
          })
          queryClient.invalidateQueries({
            queryKey: ["userLiquidity", account.address, tradingAddr],
          });
          track(EVENTS.REMOVE_LIQUIDITY, {
            amount,
            type: "removeLiquidity",
            tradingAddr,
            campaignId,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Removing liquidity...",
        success: "Liquidity removed successfully!",
        error: "Failed to remove.",
      },
    );
  const claim = async () =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) return connect()
          if (!publicClient) throw new Error("Public client is not set")

          const simulation = await publicClient.simulateContract({
            ...tradingContract,
            functionName: "removeLiquidity3C857A15",
            args: [BigInt(0), account.address as `0x${string}`]
          })
          const [lpedAmount, lpRewards] = simulation.result

          if (
            lpedAmount === BigInt(0) &&
            lpRewards === BigInt(0)
          ) {
            throw new Error("You don't have anything to claim.");
          }
          await checkAndSwitchChain();
          await writeContract({
            ...tradingContract,
            functionName: "removeLiquidity3C857A15",
            args: [BigInt(0), account.address as `0x${string}`]
          });
          queryClient.invalidateQueries({
            queryKey: ["userLiquidity", account.address, tradingAddr],
          });
          track(EVENTS.REMOVE_LIQUIDITY, {
            amount: BigInt(0),
            type: "claimLiquidity",
            tradingAddr,
            campaignId,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Claiming liquidity and rewards...",
        success: "Liquidity claimed successfully!",
        error: (e) => e?.shortMessage ?? e?.message ?? "Failed to claim.",
      },
    );

  const checkLpRewards = async () => {
    if (!account.address) return
    if (!publicClient) return

    const simulation = await publicClient.simulateContract({
      ...tradingContract,
      functionName: "removeLiquidity3C857A15",
      args: [BigInt(0), account.address as `0x${string}`]
    })

    const [lpedAmount, lpRewards] = simulation.result

    return BigInt(lpRewards ?? 0);
  };

  return { add, remove, claim, checkLpRewards, addWithRelay };
}
