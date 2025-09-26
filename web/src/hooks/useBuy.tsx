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
import { MaxUint256 } from "ethers";

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
  const buy = async (fusdc: number, referrer: string) =>
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
                tradingAddr,
                config.contracts.fusdc.address,
                outcomeId,
                minSharesOut,
                maxSharesOut,
                amount,
                referrer,
                BigInt(0), //rebate
                BigInt(Math.floor(Date.now() / 1000) + 60 * 30), // deadline
                account.address,
              ],
            });
          };
          const allowanceTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "allowance",
            params: [account.address, config.contracts.buyHelper2.address],
          });
          const allowance = (await simulateTransaction({
            transaction: allowanceTx,
            account,
          })) as bigint;
          if (amount > allowance) {
            const approveTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "approve",
              params: [config.contracts.buyHelper2.address, amount],
            });
            await sendTransaction({
              transaction: approveTx,
              account,
            });
          }
          const simulatedShares = await simulateTransaction({
            transaction: mintWith9LivesTx(),
            account,
          });

          await sendTransaction({
            transaction: mintWith9LivesTx(simulatedShares),
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
