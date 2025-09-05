import config from "@/config";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { track, EVENTS } from "@/utils/analytics";
import useRequestPaymaster from "./useRequestPaymaster";
import { useActiveAccount } from "thirdweb/react";
import { usePaymasterStore } from "@/stores/paymasterStore";
import { chainIdToEid } from "@/config/chains";
import { ZeroAddress } from "ethers";

const useWithdraw = () => {
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
      outgoingChainEid,
    }: Parameters<typeof requestPaymaster>[0]) =>
      requestPaymaster({
        amountToSpend,
        outcome,
        opType,
        outgoingChainEid,
        tradingAddr,
        minimumBack,
      }),
    onMutate: async (newRequest) => {
      await queryClient.cancelQueries({
        queryKey: ["balance", account?.address, config.NEXT_PUBLIC_FUSDC_ADDR],
      });
      const previousBalance =
        queryClient.getQueryData<string>([
          "balance",
          account?.address,
          config.NEXT_PUBLIC_FUSDC_ADDR,
        ]) ?? "0";
      // Optimistically update the cache if previousBalance not zero
      if (previousBalance !== "0") {
        const leftAmount =
          BigInt(previousBalance) - BigInt(newRequest.amountToSpend);
        const amount = leftAmount > BigInt(0) ? leftAmount : BigInt(0);
        queryClient.setQueryData(
          ["balance", account?.address, config.NEXT_PUBLIC_FUSDC_ADDR],
          () => amount.toString(),
        );
      }
      // Return context to roll back
      return { previousBalance };
    },
    onError: (err, newRequest, context) => {
      if (context?.previousBalance) {
        queryClient.setQueryData(
          ["balance", account?.address, config.NEXT_PUBLIC_FUSDC_ADDR],
          context.previousBalance,
        );
      }
    },
    onSettled: (result, err) => {
      // invalidate queries not here but, after reading paymaster tickets
    },
  });
  const withdraw = async (fusdc: number, chainId: number) =>
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
            throw new Error("You dont have enough USDC.");
          }
          const result = await requestPaymasterOptimistically({
            amountToSpend: amount,
            opType: "WITHDRAW_USDC",
            outcome: "0x0000000000000000",
            tradingAddr: ZeroAddress,
            outgoingChainEid: chainIdToEid[chainId],
            minimumBack: "0",
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              opType: "WITHDRAW_USDC",
              account,
            });
            track(EVENTS.WITHDRAW_USDC, {
              amount: result.amount,
              chainId,
              chainEid: chainIdToEid[chainId],
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
        loading: "Withdrawing usdc...",
        success: "USDC bridged successfully!",
        error: (e) => `${e?.shortMessage ?? e?.message ?? "Unknown error"}`,
      },
    );
  return { withdraw };
};

export default useWithdraw;
