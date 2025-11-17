import config from "@/config";
import { encode, prepareContractCall } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CampaignDetail,
  DppmMetadata,
  Outcome,
  SimpleCampaignDetail,
} from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { getClient, adaptViemWallet } from "@reservoir0x/relay-sdk";
import { viemAdapter } from "thirdweb/adapters/viem";
import {
  useActiveWallet,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import RelayTxToaster from "@/components/relayTxToaster";
import { MaxUint256 } from "ethers";

type TradeType = "EXACT_INPUT" | "EXACT_OUTPUT" | "EXPECTED_OUTPUT";
const useBuyWithRelay = ({
  shareAddr,
  outcomeId,
  data,
}: {
  shareAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  data: CampaignDetail | SimpleCampaignDetail;
}) => {
  const queryClient = useQueryClient();
  const wallet = useActiveWallet();
  const chain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const buyWithRelay = async (
    account: Account,
    fromAmount: number,
    usdValue: number,
    fromChain: number,
    fromToken: string,
    toChain: number,
    toToken: string,
    outcomes: Outcome[],
    referrer: string,
    fromDecimals?: number,
    dppmMetadata?: DppmMetadata,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        const operationStart = performance.now();
        try {
          if (!fromDecimals) throw new Error("fromDecimals is undefined");
          if (!wallet) throw new Error("No wallet is detected");
          if (!chain) throw new Error("No chain is detected");
          const fromAmountBigInt = toUnits(fromAmount.toString(), fromDecimals);
          const toAmountRes = await fetch("https://api.relay.link/quote", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: account?.address,
              originChainId: fromChain,
              destinationChainId: toChain,
              originCurrency: fromToken,
              destinationCurrency: toToken,
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
          const toAmount = toAmountData.details.currencyOut.amount;
          const mintWith9LivesTx = (simulatedShare?: bigint) => {
            const minSharesOut = simulatedShare
              ? (simulatedShare * BigInt(95)) / BigInt(100)
              : BigInt(0);
            const maxSharesOut = simulatedShare
              ? (simulatedShare * BigInt(105)) / BigInt(100)
              : MaxUint256;
            return prepareContractCall({
              contract: config.contracts.buyHelper2,
              method: "mint",
              params: [
                data.poolAddress,
                toToken,
                outcomeId,
                minSharesOut,
                maxSharesOut,
                toAmount,
                referrer,
                BigInt(0), //rebate
                BigInt(Math.floor(Date.now() / 1000) + 60 * 30), // deadline
                account.address,
              ],
            });
          };
          // const return9lives = await simulateTransaction({
          //   transaction: mintWith9LivesTx(),
          // });
          // sets minimum share to %90 of expected return shares
          // const minShareOut = (return9lives * BigInt(9)) / BigInt(10);

          const transaction = mintWith9LivesTx();

          const calldata = await encode(transaction);

          const options = {
            user: account.address,
            chainId: fromChain,
            toChainId: toChain,
            currency: fromToken,
            toCurrency: toToken,
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

          if (fromChain !== chain.id) {
            targetChain = Object.values(config.chains).find(
              (c) => c.id === fromChain,
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

          res(null);
          track(EVENTS.MINT, {
            fromChain,
            fromToken,
            amount: toAmount,
            outcomeId,
            shareAddr,
            usdValue,
            operationStart,
            operationEnd: performance.now(),
            tradingAddr: data.poolAddress,
            status: "success",
            type: "buyWithRelay",
            ...(dppmMetadata ?? {}),
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

          const outcomeIds = outcomes.map((o) => o.identifier);
          queryClient.invalidateQueries({
            queryKey: [
              "positions",
              data.poolAddress,
              data.outcomes,
              account,
              data.isDpm,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["sharePrices", data.poolAddress, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "returnValue",
              shareAddr,
              data.poolAddress,
              outcomeId,
              usdValue,
            ],
          });
          if (data.priceMetadata) {
            queryClient.invalidateQueries({
              queryKey: ["simpleCampaign", data.priceMetadata.baseAsset],
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: ["campaign", data.identifier],
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["positionHistory", account.address, outcomeIds],
          });
        } catch (e) {
          if (
            !(
              e instanceof Error &&
              (e.cause as { code?: number })?.code === 4001
            )
          ) {
            // dont track if user rejects
            track(EVENTS.MINT, {
              fromChain,
              fromToken,
              fromAmount,
              outcomeId,
              shareAddr,
              usdValue,
              operationStart,
              operationEnd: performance.now(),
              tradingAddr: data.poolAddress,
              status: "failure",
              type: "buyWithRelay",
              ...(dppmMetadata ?? {}),
              error: e,
            });
          }
          rej(e);
        }
      }),
      {
        loading: "Buying shares...",
        success: "Shares bought successfully!",
        error: (e) => `${e?.shortMessage ?? e?.message ?? "Unknown error"}`,
      },
    );

  return { buyWithRelay };
};

export default useBuyWithRelay;
