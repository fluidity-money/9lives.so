import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { EVENTS, track } from "@/utils/analytics";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  encode,
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  toUnits,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
import { useAllowanceCheck } from "./useAllowanceCheck";
import { MaxUint256 } from "ethers";
import {
  useActiveWallet,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { adaptViemWallet, getClient } from "@reservoir0x/relay-sdk";
import { viemAdapter } from "thirdweb/adapters/viem";
import RelayTxToaster from "@/components/relayTxToaster";
import { Outcome } from "@/types";
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
  outcomes,
}: {
  tradingAddr: `0x${string}`;
  campaignId: `0x${string}`;
  outcomes: Outcome[];
}) {
  const queryClient = useQueryClient();
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: config.thirdweb.client,
    chain: config.destinationChain,
  });
  const { checkAndAprove } = useAllowanceCheck();
  const chain = useActiveWalletChain();
  const wallet = useActiveWallet();
  const switchChain = useSwitchActiveWalletChain();
  const add = async (account: Account, fusdc: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const amount = toUnits(fusdc, config.contracts.decimals.shares);
          await checkAndAprove({
            contractAddress: config.contracts.fusdc.address,
            spenderAddress: tradingAddr,
            account,
            amount,
          });
          const addLiquidityTx = (simulatedShare?: bigint) => {
            const minShares = simulatedShare
              ? (simulatedShare * BigInt(95)) / BigInt(100)
              : BigInt(0);
            const maxShares = simulatedShare
              ? (simulatedShare * BigInt(105)) / BigInt(100)
              : MaxUint256;
            return prepareContractCall({
              contract: config.contracts.buyHelper2,
              method: "addLiquidity",
              params: [
                tradingAddr,
                config.NEXT_PUBLIC_FUSDC_ADDR,
                amount,
                account.address,
                minShares,
                maxShares,
                BigInt(0),
                outcomes.map((o) => ({
                  identifier: o.identifier,
                  minToken: BigInt(0),
                  maxToken: MaxUint256,
                })),
                BigInt(Math.floor(Date.now() / 1000) + 60 * 60),
              ],
            });
          };
          const simulatedShare = await simulateTransaction({
            transaction: addLiquidityTx(),
            account,
          });
          await sendTransaction({
            transaction: addLiquidityTx(simulatedShare),
            account,
          });
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
    account: Account,
    input: AddInput,
    fromDecimals?: number,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!fromDecimals) throw new Error("fromDecimals is undefined");
          if (!wallet) throw new Error("No wallet is detected");
          if (!chain) throw new Error("No chain is detected");
          const fromAmountBigInt = toUnits(
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

          const addLiquidityTx = (simulatedShare?: bigint) => {
            const minShares = simulatedShare
              ? (simulatedShare * BigInt(95)) / BigInt(100)
              : BigInt(0);
            const maxShares = simulatedShare
              ? (simulatedShare * BigInt(105)) / BigInt(100)
              : MaxUint256;
            return prepareContractCall({
              contract: config.contracts.buyHelper2,
              method: "addLiquidity",
              params: [
                tradingAddr,
                input.toToken,
                BigInt(toAmount),
                account.address,
                minShares,
                maxShares,
                BigInt(0),
                outcomes.map((o) => ({
                  identifier: o.identifier,
                  minToken: BigInt(0),
                  maxToken: MaxUint256,
                })),
                BigInt(Math.floor(Date.now() / 1000) + 60 * 60),
              ],
            });
          };
          // const simulatedShare = await simulateTransaction({
          //   transaction: addLiquidityTx(),
          //   account,
          // });
          // await sendTransaction({
          //   transaction: addLiquidityTx(simulatedShare),
          //   account,
          // });
          const calldata = await encode(addLiquidityTx());

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

          let targetChain = chain;

          if (input.fromChain !== chain.id) {
            targetChain = Object.values(config.chains).find(
              (c) => c.id === input.fromChain,
            )!;
            await switchChain(targetChain);
          }

          const walletClient = viemAdapter.wallet.toViem({
            client: config.thirdweb.client,
            chain: targetChain,
            wallet,
          });
          let requestId: string | undefined;
          await relayClient.actions.execute({
            quote,
            wallet: adaptViemWallet(walletClient as any),
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
    account: Account,
    fusdc: string,
    totalLiquidity: number,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const _fusdc = toUnits(fusdc, config.contracts.decimals.shares);
          const diff = BigInt(totalLiquidity) - _fusdc;
          const amount =
            BigInt(1e6) > diff ? BigInt(totalLiquidity) - BigInt(1e6) : _fusdc; // always 1 usdc should be secured in liquidity pool
          const removeLiquidityTx = prepareContractCall({
            contract: tradingContract,
            method: "removeLiquidity3C857A15",
            params: [amount, account.address],
          });
          await sendTransaction({
            transaction: removeLiquidityTx,
            account,
          });
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
  const claim = async (account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const claimLiquidityTx = prepareContractCall({
            contract: tradingContract,
            method: "removeLiquidity3C857A15",
            params: [BigInt(0), account.address],
          });
          const [lpedAmount, lpRewards] = await simulateTransaction({
            transaction: claimLiquidityTx,
            account,
          });
          if (
            BigInt(lpRewards) === BigInt(0) &&
            BigInt(lpedAmount) === BigInt(0)
          ) {
            throw new Error("You don't have anything to claim.");
          }
          await sendTransaction({
            transaction: claimLiquidityTx,
            account,
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

  const checkLpRewards = async (account: Account) => {
    const claimLiquidityTx = prepareContractCall({
      contract: tradingContract,
      method: "removeLiquidity3C857A15",
      params: [BigInt(0), account.address],
    });
    const [lpedAmount, lpRewards] = await simulateTransaction({
      transaction: claimLiquidityTx,
      account,
    });

    return BigInt(lpRewards ?? 0);
  };

  return { add, remove, claim, checkLpRewards, addWithRelay };
}
