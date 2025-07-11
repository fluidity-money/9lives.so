import config from "@/config";
import { encode, prepareContractCall, simulateTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { getClient, adaptViemWallet } from "@reservoir0x/relay-sdk";
import { viemAdapter } from "thirdweb/adapters/viem";
import {
  useActiveWallet,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import RelayTxToaster from "@/components/relayTxToaster";

const useBuyWithRelay = ({
  shareAddr,
  tradingAddr,
  campaignId,
  outcomeId,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  campaignId: `0x${string}`;
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
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
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
              tradeType: "EXACT_INPUT",
            }),
          });
          const toAmountData = await toAmountRes.json();
          const toAmount = toAmountData.details.currencyOut.amount;
          const mintWith9LivesTx = (minShareOut = BigInt(0)) =>
            prepareContractCall({
              contract: config.contracts.buyHelper2,
              method: "mint",
              params: [
                tradingAddr,
                toToken,
                outcomeId,
                minShareOut,
                toAmount,
                referrer,
                BigInt(0), //rebate
                BigInt(Math.floor(Date.now() / 1000) + 60 * 30), // deadline
                account.address,
              ],
              value: minShareOut === BigInt(0) ? toAmount : undefined,
            });
          const return9lives = await simulateTransaction({
            transaction: mintWith9LivesTx(),
          });
          // sets minimum share to %90 of expected return shares
          const minShareOut = (return9lives * BigInt(9)) / BigInt(10);

          const transaction = mintWith9LivesTx(minShareOut);

          const calldata = await encode(transaction);

          type TradeType = "EXACT_INPUT" | "EXACT_OUTPUT" | "EXPECTED_OUTPUT";
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
            queryKey: ["positions", tradingAddr, outcomes, account],
          });
          queryClient.invalidateQueries({
            queryKey: ["sharePrices", tradingAddr, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "returnValue",
              shareAddr,
              tradingAddr,
              outcomeId,
              usdValue,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId],
          });
          queryClient.invalidateQueries({
            queryKey: ["positionHistory", outcomeIds],
          });
          track(EVENTS.MINT, {
            fromChain,
            fromToken,
            wallet: account.address,
            amount: toAmount,
            outcomeId,
            shareAddr,
            tradingAddr,
            buyWithZaps: true,
          });
          res(null);
        } catch (e) {
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
