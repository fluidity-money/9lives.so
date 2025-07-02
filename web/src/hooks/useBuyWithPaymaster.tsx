import config from "@/config";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignDetail, MintedPosition, Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import useRequestPaymaster from "./useRequestPaymaster";
import { useActiveAccount } from "thirdweb/react";
import formatFusdc from "@/utils/formatFusdc";
import { usePaymasterStore } from "@/stores/paymasterStore";

const useBuyWithPaymaster = ({
  shareAddr,
  tradingAddr,
  outcomeId,
  data,
  outcomes,
  openFundModal,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  data: CampaignDetail;
  outcomes: Outcome[];
  openFundModal: () => void;
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
      let newPosition: MintedPosition;
      let newPositions: MintedPosition[];
      const previousPositions =
        queryClient.getQueryData<MintedPosition[]>([
          "positions",
          tradingAddr,
          outcomes,
          account,
        ]) ?? [];
      const alreadyExistedPosition = previousPositions?.find(
        (p) => p.id === newRequest.outcome,
      );
      if (alreadyExistedPosition) {
        newPosition = {
          ...alreadyExistedPosition,
          balanceRaw:
            alreadyExistedPosition.balanceRaw +
            BigInt(newRequest.amountToSpend),
          balance: (
            Number(alreadyExistedPosition.balance) +
            Number(formatFusdc(newRequest.amountToSpend, 2))
          ).toString(),
        };
        newPositions = [
          ...previousPositions.filter(
            (p) => p.id !== alreadyExistedPosition.id,
          ),
          newPosition,
        ];
      } else {
        const investedOutcome = outcomes.find(
          (o) => o.identifier === newRequest.outcome,
        );
        newPosition = {
          id: investedOutcome?.identifier ?? "0x",
          balanceRaw: BigInt(newRequest.amountToSpend),
          balance: formatFusdc(newRequest.amountToSpend, 2),
          name: investedOutcome?.name ?? "Unknown",
          shareAddress: investedOutcome?.share.address ?? "0x",
        };
        newPositions = [...previousPositions, newPosition];
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
      // invalidate queries not here but, after reading paymaster ticket ids
      // const outcomeIds = outcomes.map((o) => o.identifier);
      // queryClient.invalidateQueries({
      //   queryKey: ["positions", tradingAddr, outcomes, account],
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["sharePrices", tradingAddr, outcomeIds],
      // });
      // queryClient.invalidateQueries({
      //   queryKey: [
      //     "returnValue",
      //     shareAddr,
      //     tradingAddr,
      //     outcomeId,
      //     result?.amount,
      //   ],
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["campaign", campaignId],
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["positionHistory", outcomeIds],
      // });
    },
  });
  const buy = async (fusdc: number) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account) throw new Error("No active account");
          const amount = toUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          ).toString();
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
          const result = await requestPaymasterOptimistically({
            amountToSpend: amount,
            outcome: outcomeId,
            opType: "MINT",
            tradingAddr: tradingAddr,
            minimumBack: "0",
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              data,
              outcomeId,
              account,
            });
            track(EVENTS.MINT, {
              wallet: account.address,
              amount: result.amount,
              outcomeId,
              shareAddr,
              type: "buyWithPaymaster",
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
        loading: "Buying shares...",
        success: "Shares bought successfully!",
        error: (e: unknown) =>
          `Create failed. ${e instanceof Error ? e.message : e instanceof String ? e : `Unknown error: ${JSON.stringify(e)}`}`,
      },
    );

  return { buy };
};

export default useBuyWithPaymaster;
