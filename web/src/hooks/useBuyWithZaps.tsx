import config from "@/config";
import { encode, prepareContractCall } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import {
  convertQuoteToRoute,
  executeRoute,
  getContractCallsQuote,
} from "@lifi/sdk";
import { ZeroAddress } from "ethers";

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

          const toAmountRes = await fetch(urlGetQuote, optionsGet);
          const toAmountData = await toAmountRes.json();
          const toAmount = toAmountData.estimate.toAmount;

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
            });
          // const return9lives = await simulateTransaction({
          //   transaction: mintWith9LivesTx(),
          //   account,
          // });
          // sets minimum share to %90 of expected return shares
          // const minShareOut = (return9lives * BigInt(9)) / BigInt(10);

          const transaction = mintWith9LivesTx();

          const calldata = await encode(transaction);

          const contractCallsQuoteRequest = {
            fromChain,
            fromToken,
            fromAddress: account.address!,
            toChain,
            toToken,
            toAmount,
            contractCalls: [
              {
                fromAmount: toAmount,
                fromTokenAddress: toToken,
                toContractAddress: config.contracts.buyHelper2.address,
                toContractCallData: calldata,
                toContractGasLimit: "900000",
              },
            ],
            integrator: "superposition",
            // referrer: 'superposition',
            // slippage: 0.005,
            // fee: 0.01
          };
          const quote = await getContractCallsQuote(contractCallsQuoteRequest);

          const route = convertQuoteToRoute(quote);

          await executeRoute(route);

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
        error: (e) => `${e?.message ?? "Unknown error"}`,
      },
    );

  return { buyWithZaps };
};

export default useBuyWithZaps;
