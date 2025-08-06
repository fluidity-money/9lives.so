import config from "@/config";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { track, EVENTS } from "@/utils/analytics";
import useRequestPaymaster from "./useRequestPaymaster";
import { usePaymasterStore } from "@/stores/paymasterStore";
import { chainIdToEid } from "@/config/chains";
import { ZeroAddress } from "ethers";
import { Account } from "thirdweb/wallets";

const useWithdraw = () => {
  const queryClient = useQueryClient();
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
      // Optimistically update the cache
      queryClient.setQueryData(
        ["balance", account?.address, config.NEXT_PUBLIC_FUSDC_ADDR],
        () => "0",
      );
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
  const withdraw = async (fusdc: number, chainId: number, account?: Account) =>
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
              wallet: account.address,
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
