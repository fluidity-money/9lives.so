import config from "@/config";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  toUnits,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import ERC20Abi from "@/config/abi/erc20";
const useSell = ({
  shareAddr,
  tradingAddr,
  campaignId,
  outcomeId,
  outcomes,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  campaignId: `0x${string}`;
  outcomes: Outcome[];
}) => {
  const queryClient = useQueryClient();
  const sell = async (account: Account, share: number, fusdc: number) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const usdAmount = toUnits(
            fusdc.toFixed(config.contracts.decimals.fusdc),
            config.contracts.decimals.fusdc,
          );
          const shareAmount = toUnits(
            share.toFixed(config.contracts.decimals.shares),
            config.contracts.decimals.shares,
          );
          const shareContract = getContract({
            abi: ERC20Abi,
            address: shareAddr,
            client: config.thirdweb.client,
            chain: config.destinationChain,
          });

          const minShareOut = BigInt(Math.floor(Number(shareAmount) * 0.95));
          const maxShareOut = shareAmount;
          const allowanceTx = prepareContractCall({
            contract: shareContract,
            method: "allowance",
            params: [account.address, config.contracts.buyHelper.address],
          });
          const allowance = await simulateTransaction({
            transaction: allowanceTx,
            account,
          });
          if (shareAmount > allowance) {
            const approveTx = prepareContractCall({
              contract: shareContract,
              method: "approve",
              params: [config.contracts.buyHelper.address, shareAmount],
            });
            await sendTransaction({
              transaction: approveTx,
              account,
            });
          }
          const burnTx = prepareContractCall({
            contract: config.contracts.buyHelper,
            method: "burn",
            params: [
              tradingAddr,
              outcomeId,
              usdAmount,
              maxShareOut,
              minShareOut,
              account.address,
            ],
          });
          await sendTransaction({
            transaction: burnTx,
            account,
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
          track(EVENTS.BURN, {
            wallet: account.address,
            amount: fusdc,
            maxShareOut,
            minShareOut,
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
        loading: "Selling shares...",
        success: "Shares sold successfully!",
        error: (e: unknown) =>
          `Create failed. ${e instanceof Error ? e.message : e instanceof String ? e : `Unknown error: ${JSON.stringify(e)}`}`,
      },
    );

  return { sell };
};

export default useSell;
