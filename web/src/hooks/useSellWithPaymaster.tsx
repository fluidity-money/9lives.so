import config from "@/config";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignDetail, MintedPosition, Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import useRequestPaymaster from "./useRequestPaymaster";
import { useActiveAccount } from "thirdweb/react";
import { usePaymasterStore } from "@/stores/paymasterStore";
import ERC20Abi from "@/config/abi/erc20";
import { destinationChain } from "@/config/chains";

const useSellWithPaymaster = ({
  shareAddr,
  tradingAddr,
  outcomeId,
  data,
  outcomes,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  data: CampaignDetail;
  outcomes: Outcome[];
}) => {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { requestPaymaster } = useRequestPaymaster();
  const createTicket = usePaymasterStore((s) => s.createTicket);
  const { mutateAsync: requestPaymasterOptimistically } = useMutation({
    mutationFn: ({
      amountToSpend,
      outcome,
      opType,
      tradingAddr,
      minimumBack,
    }: Parameters<typeof requestPaymaster>[0]) =>
      requestPaymaster({
        amountToSpend,
        outcome,
        opType,
        tradingAddr,
        minimumBack,
      }),
    onMutate: async (newRequest) => {
      await queryClient.cancelQueries({
        queryKey: ["positions", tradingAddr, outcomes, account],
      });
      const amountToSell = toUnits(
        newRequest.minimumBack,
        config.contracts.decimals.shares,
      );
      let newPositions: MintedPosition[];
      const previousPositions =
        queryClient.getQueryData<MintedPosition[]>([
          "positions",
          tradingAddr,
          outcomes,
          account,
        ]) ?? [];
      const existedPositionAmount =
        previousPositions?.find((p) => p.id === newRequest.outcome)
          ?.balanceRaw ?? BigInt(0);

      if (amountToSell >= existedPositionAmount) {
        newPositions = previousPositions.filter(
          (p) => p.id !== newRequest.outcome,
        );
      } else {
        newPositions = previousPositions.map((p) =>
          p.id === newRequest.outcome
            ? {
                ...p,
                balance: (
                  Number(p.balance) - Number(newRequest.minimumBack)
                ).toString(),
                balanceRaw: p.balanceRaw - amountToSell,
              }
            : p,
        );
      }

      // Optimistically update the cache
      queryClient.setQueryData(
        ["positions", tradingAddr, outcomes, account],
        () => newPositions,
      );

      // Return context to roll back
      return { previousPositions };
    },
    onError: (err, newRequest, context) => {
      if (context?.previousPositions) {
        queryClient.setQueryData(
          ["positions", tradingAddr, outcomes, account],
          context.previousPositions,
        );
      }
    },
    onSettled: (result, err) => {
      // invalidate queries not here but, after reading paymaster tickets
      // check providers/websocket.tsx
      //      const outcomeIds = outcomes.map((o) => o.identifier);
      //   queryClient.invalidateQueries({
      //     queryKey: ["positions", tradingAddr, outcomes, account],
      //   });
      //   queryClient.invalidateQueries({
      //     queryKey: ["sharePrices", tradingAddr, outcomeIds],
      //   });
      //   queryClient.invalidateQueries({
      //     queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, fusdc],
      //   });
      //   queryClient.invalidateQueries({
      //     queryKey: ["campaign", campaignId],
      //   });
      //   queryClient.invalidateQueries({
      //     queryKey: ["positionHistory", outcomeIds],
      //   });
    },
  });
  const sell = async (rawAmount: number) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account) throw new Error("No active account");
          const amount = toUnits(
            rawAmount.toString(),
            config.contracts.decimals.shares,
          ).toString();
          const shareContract = getContract({
            abi: ERC20Abi,
            address: shareAddr,
            chain: destinationChain,
            client: config.thirdweb.client,
          });
          const userBalanceTx = prepareContractCall({
            contract: shareContract,
            method: "balanceOf",
            params: [account?.address],
          });
          const userBalance = await simulateTransaction({
            transaction: userBalanceTx,
            account,
          });
          if (amount > userBalance) {
            throw new Error("You dont have enough shares.");
          }
          const result = await requestPaymasterOptimistically({
            amountToSpend: "0",
            outcome: outcomeId,
            opType: "SELL",
            tradingAddr: tradingAddr,
            minimumBack: amount,
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              data,
              opType: "SELL",
              outcomeId,
              account,
            });
            track(EVENTS.BURN, {
              wallet: account.address,
              amount,
              type: "sellWithPaymaster",
              outcomeId,
              shareAddr,
              tradingAddr,
            });
            res(result.ticketId);
          } else {
            rej("Something went wrong!");
          }
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Selling shares...",
        success: "Shares sold successfully!",
        error: (e) => `${e?.shortMessage ?? e?.message ?? "Unknown error"}`,
      },
    );

  return { sell };
};

export default useSellWithPaymaster;
