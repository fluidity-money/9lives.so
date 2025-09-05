import config from "@/config";
import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { useActiveAccount } from "thirdweb/react";

const useBuy = ({
  shareAddr,
  tradingAddr,
  campaignId,
  outcomeId,
  outcomes,
  openFundModal,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  outcomes: Outcome[];
  campaignId: `0x${string}`;
  openFundModal: () => void;
}) => {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const buy = async (fusdc: number) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account) throw new Error("No active account");
          const amount = toUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          );
          const userBalanceTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "balanceOf",
            params: [account?.address],
          });
          const userBalance = await simulateTransaction({
            transaction: userBalanceTx,
            account,
          });
          if (amount > userBalance) {
            openFundModal();
            throw new Error("You dont have enough USDC.");
          }
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
          const allowanceTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "allowance",
            params: [account.address, config.contracts.buyHelper.address],
          });
          const allowance = (await simulateTransaction({
            transaction: allowanceTx,
            account,
          })) as bigint;
          if (amount > allowance) {
            const approveTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "approve",
              params: [config.contracts.buyHelper.address, amount],
            });
            await sendTransaction({
              transaction: approveTx,
              account,
            });
          }
          const return9lives = await simulateTransaction({
            transaction: mintWith9LivesTx(),
            account,
          });

          // sets minimum share to %90 of expected return shares
          const minShareOut = (return9lives * BigInt(9)) / BigInt(10);
          await sendTransaction({
            transaction: mintWith9LivesTx(minShareOut),
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
          track(EVENTS.MINT, {
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
        error: (e) => `${e?.message ?? "Unknown error"}`,
      },
    );

  return { buy };
};

export default useBuy;
