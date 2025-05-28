import config from "@/config";
import {
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
import {
  convertQuoteToRoute,
  executeRoute,
  getContractCallsQuote,
} from "@lifi/sdk";

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
    fusdc: number,
    fromChain: number,
    fromToken: string,
    outcomes: Outcome[],
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const amount = toUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          );

          const mintWith9LivesTx = (minShareOut = BigInt(0)) =>
            prepareContractCall({
              contract: config.contracts.buyHelper,
              method: "mint",
              params: [
                tradingAddr,
                config.contracts.fusdc.address,
                outcomeId,
                minShareOut,
                amount,
                account.address,
              ],
            });
          //   const allowanceTx = prepareContractCall({
          //     contract: config.contracts.fusdc,
          //     method: "allowance",
          //     params: [account.address, config.contracts.buyHelper.address],
          //   });
          //   const allowance = (await simulateTransaction({
          //     transaction: allowanceTx,
          //     account,
          //   })) as bigint;
          //   if (amount > allowance) {
          //     const approveTx = prepareContractCall({
          //       contract: config.contracts.fusdc,
          //       method: "approve",
          //       params: [config.contracts.buyHelper.address, amount],
          //     });
          //     await sendTransaction({
          //       transaction: approveTx,
          //       account,
          //     });
          //   }
          const return9lives = await simulateTransaction({
            transaction: mintWith9LivesTx(),
            account,
          });

          // sets minimum share to %90 of expected return shares
          const minShareOut = (return9lives * BigInt(9)) / BigInt(10);
          const transaction = mintWith9LivesTx(minShareOut);
          // const url = 'https://li.quest/v1/quote/contractCall';
          // const options = {
          //     method: 'POST',
          //     headers: {
          //         accept: 'application/json',
          //         'content-type': 'application/json',
          //     },
          //     body: JSON.stringify({
          //         toChain: 55244,
          //         toToken: '0x6c030c5CC283F791B26816f325b9C632d964F8A1',
          //         fromChain,
          //         fromToken,
          //         fromAddress: account.address,
          //         toContractAddress: transaction.to,
          //         toContractCallData: transaction.data,
          //         toContractGasLimit: transaction.gas,
          //         integrator: 'superposition',
          //         // referrer: 'superposition',
          //         // slippage: 0.005,
          //         // fee: 0.01
          //     })
          // };

          const contractCallQuote = await getContractCallsQuote({
            toChain: 55244,
            toToken: "0x6c030c5CC283F791B26816f325b9C632d964F8A1",
            fromChain,
            fromToken,
            fromAddress: account.address,
            toAmount: amount.toString(),
            contractCalls: [
              {
                fromTokenAddress: config.contracts.fusdc.address,
                fromAmount: amount.toString(),
                toContractAddress: transaction.to as any,
                toContractCallData: transaction.data as any,
                toContractGasLimit: transaction.gas as any,
              },
            ],
            integrator: "superposition",
            // referrer: 'superposition',
            // slippage: 0.005,
            // fee: 0.01
          });

          // const quoteResponse = await fetch(url, options)
          // const quote = await quoteResponse.json()
          const route = convertQuoteToRoute(contractCallQuote);

          await executeRoute(route, {
            // Gets called once the route object gets new updates
            updateRouteHook(route: any) {
              console.log(route);
            },
          });

          const outcomeIds = outcomes.map((o) => o.identifier);
          queryClient.invalidateQueries({
            queryKey: ["positions", tradingAddr, outcomes, account],
          });
          queryClient.invalidateQueries({
            queryKey: ["sharePrices", tradingAddr, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, fusdc],
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
            amount: fusdc,
            outcomeId,
            shareAddr,
            tradingAddr,
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
