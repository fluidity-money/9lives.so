import config from "@/config";
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
import { encodeFunctionData, maxUint256 } from "viem";
import RelayTxToaster from "@/components/relayTxToaster";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import useFeatureFlag from "./useFeatureFlag";
import { parseUnits } from "viem";
import useCheckAndSwitchChain from "./useCheckAndSwitchChain";
import { createWalletClient, custom } from "viem";
import { useAppKitProvider } from "@reown/appkit/react";

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
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const enableExactInputBuyWithRelay = useFeatureFlag(
    "enable exact input style buy with relay",
  );
  const { walletProvider } = useAppKitProvider("eip155");
  const buyWithRelay = async (
    address: string,
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
          const fromAmountBigInt = parseUnits(
            fromAmount.toString(),
            fromDecimals,
          );
          const options = (
            amount: string,
            tradeType: TradeType,
            txs?: { to: `0x${string}`; value: string; data: `0x${string}` }[],
          ) => ({
            user: address,
            chainId: fromChain,
            toChainId: toChain,
            currency: fromToken,
            toCurrency: toToken,
            recipient: address,
            referrer: "9lives.so",
            amount, // Total value of all txs
            tradeType,
            txs,
          });
          const relayClient = getClient();
          const toAmountData = await relayClient.actions.getQuote(
            options(fromAmountBigInt.toString(), "EXACT_INPUT"),
          );
          const toAmount = toAmountData.details?.currencyOut?.amount ?? "0";
          const mintWith9LivesTx = (
            amount: string,
            simulatedShare?: bigint,
          ) => {
            const minSharesOut = simulatedShare
              ? (simulatedShare * BigInt(95)) / BigInt(100)
              : BigInt(0);
            const maxSharesOut = simulatedShare
              ? (simulatedShare * BigInt(105)) / BigInt(100)
              : maxUint256;
            return {
              ...(config.contracts
                .buyHelper2 as typeof config.contracts.buyHelper2),
              functionName: "mint",
              args: [
                data.poolAddress as `0x${string}`,
                config.contracts.fusdc.address,
                outcomeId as `0x${string}`,
                minSharesOut,
                maxSharesOut,
                BigInt(amount),
                referrer as `0x${string}`,
                BigInt(0), //rebate
                BigInt(Math.floor(Date.now() / 1000) + 60 * 30), // deadline
                address as `0x${string}`,
              ],
            } as const;
          };
          // We can do a simulation before to use simulated share as a slippage guard
          // But Relay have failed to simulate it on target chain, because user only have balance on from chain.

          const calldata = await encodeFunctionData(
            mintWith9LivesTx(
              toAmount,
              // we can use simulated share here as second arg
            ),
          );

          let quote = await relayClient.actions.getQuote(
            options(toAmount, "EXACT_OUTPUT", [
              {
                to: config.contracts.buyHelper2.address,
                value: toAmount,
                data: calldata,
              },
            ]),
          );

          if (enableExactInputBuyWithRelay) {
            const currencyIn = quote.details?.currencyIn?.amount ?? 0;
            const feesInCurrencyIn =
              BigInt(currencyIn) - BigInt(fromAmountBigInt);
            const netCurrencyInAmount = fromAmountBigInt - feesInCurrencyIn;
            if (BigInt(0) >= netCurrencyInAmount)
              throw new Error("Insufficient balance for paying fees + buy");

            const resNetCurrencyInAmount = await relayClient.actions.getQuote(
              options(netCurrencyInAmount.toString(), "EXACT_INPUT"),
            );
            const netCurrencyOutAmount =
              resNetCurrencyInAmount.details?.currencyOut?.amount ?? "0";
            const amountWithCutdown =
              (BigInt(netCurrencyOutAmount) * BigInt(99)) / BigInt(100);
            const calldata2 = await encodeFunctionData(
              mintWith9LivesTx(amountWithCutdown.toString()),
            );
            quote = await relayClient.actions.getQuote(
              options(netCurrencyOutAmount, "EXACT_OUTPUT", [
                {
                  to: config.contracts.buyHelper2.address,
                  value: netCurrencyOutAmount,
                  data: calldata2,
                },
              ]),
            );
          }

          await checkAndSwitchChain();

          const viemWalletClient = createWalletClient({
            account: address as `0x${string}`,
            chain: Object.values(config.chains).find((i) => i.id === fromChain),
            transport: custom(walletProvider as any),
          });

          let requestId: string | undefined;
          await relayClient.actions.execute({
            quote,
            wallet: adaptViemWallet(viemWalletClient),
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
          res(requestId);
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
              address,
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
            const period = getPeriodOfCampaign(data as SimpleCampaignDetail);
            queryClient.invalidateQueries({
              queryKey: [
                "simpleCampaign",
                data.priceMetadata.baseAsset,
                period,
              ],
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: ["campaign", data.identifier],
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["positionHistory", address, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: ["tokensWithBalances", address, fromChain],
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
