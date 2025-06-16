import config from "@/config";
import {
  encode,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { convertQuoteToRoute } from "@/utils/lifi/convertToRoute";
import { executeRouteSteps } from "@/utils/lifi/executeLifiQuote";
import { formatUnits } from "ethers";

const useBuyWithZaps = ({
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
  const rebateETHForGas = "0.00035";
  const buyWithZaps = async (
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

          const optionsGet = {
            method: "GET",
            headers: { accept: "application/json" },
          };
          const fromAmountBigInt = toUnits(fromAmount.toString(), fromDecimals);
          const urlGetQuote = `https://li.quest/v1/quote?fromChain=${fromChain}&toChain=${toChain}&fromToken=${fromToken}&toToken=${toToken}&fromAddress=${account?.address}&fromAmount=${fromAmountBigInt}`;
          const urlForRebate = `https://li.quest/v1/quote?fromChain=55244&toChain=55244&fromToken=0x0000000000000000000000000000000000000000&toToken=${config.NEXT_PUBLIC_FUSDC_ADDR}&fromAddress=${account?.address}&fromAmount=${formatUnits(rebateETHForGas)}`;

          const toAmountRes = await fetch(urlGetQuote, optionsGet);
          const toAmountData = await toAmountRes.json();
          const toAmount = toAmountData.estimate.toAmount;
          console.log("toAmount", toAmount);

          const rebateAmountRes = await fetch(urlForRebate, optionsGet);
          const rebateAmountData = await rebateAmountRes.json();
          const rebateAmount = rebateAmountData.estimate.toAmount;
          console.log("rebateAmount", rebateAmount);

          const allowanceTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "allowance",
            params: [account.address, config.contracts.buyHelper2.address],
          });
          const allowance = (await simulateTransaction({
            transaction: allowanceTx,
            account,
          })) as bigint;
          if (toAmount > allowance) {
            const approveTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "approve",
              params: [config.contracts.buyHelper2.address, toAmount],
            });
            await sendTransaction({
              transaction: approveTx,
              account,
            });
          }
          const mintWith9LivesTx = (minShareOut = BigInt(0)) =>
            prepareContractCall({
              contract: config.contracts.buyHelper2,
              method: "mint",
              params: [
                tradingAddr,
                config.contracts.fusdc.address,
                outcomeId,
                minShareOut,
                toAmount,
                referrer,
                rebateAmount,
                BigInt(Math.floor(Date.now() / 1000) + 60 * 30), // deadline
                account.address,
              ],
            });
          const return9lives = await simulateTransaction({
            transaction: mintWith9LivesTx(),
            account,
          });
          // sets minimum share to %90 of expected return shares
          const minShareOut = (return9lives * BigInt(9)) / BigInt(10);

          const transaction = mintWith9LivesTx(minShareOut);
          console.log("transaction", transaction);
          const calldata = await encode(transaction);
          console.log("calldata", calldata);

          const url = "https://li.quest/v1/quote/contractCall";
          const options = {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              toChain,
              toToken,
              fromChain,
              fromToken,
              toAmount,
              fromAddress: account.address,
              toContractAddress: transaction.to,
              toContractCallData: calldata,
              toContractGasLimit: 900000,
              integrator: "superposition",
              // referrer: 'superposition',
              // slippage: 0.005,
              // fee: 0.01
            }),
          };
          const quoteResponse = await fetch(url, options);
          const quote = await quoteResponse.json();
          console.log("quote", quote);

          const route = convertQuoteToRoute(quote);

          console.log("route", route);
          await executeRouteSteps(route, account);

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
        error: (e: unknown) =>
          `Create failed. ${e instanceof Error ? e.message : e instanceof String ? e : `Unknown error: ${JSON.stringify(e)}`}`,
      },
    );

  return { buyWithZaps };
};

export default useBuyWithZaps;
