import config from "@/config";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignDetail } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import useRequestPaymaster from "./useRequestPaymaster";
import { useActiveAccount } from "thirdweb/react";
import { usePaymasterStore } from "@/stores/paymasterStore";
import { Account } from "thirdweb/wallets";

const useLiquidityWithPaymaster = ({
  tradingAddr,
  data,
}: {
  tradingAddr: `0x${string}`;
  data: CampaignDetail;
}) => {
  const idempotentOutcome = "0x0000000000000000";
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { requestPaymaster } = useRequestPaymaster();
  const createTicket = usePaymasterStore((s) => s.createTicket);
  const { mutateAsync: requestPaymasterOptimisticallyForAdd } = useMutation({
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
      // handle liquidity
      await queryClient.cancelQueries({
        queryKey: ["userLiquidity", account?.address, tradingAddr],
      });
      const previousLiquidity =
        queryClient.getQueryData<string>([
          "userLiquidity",
          account?.address,
          tradingAddr,
        ]) ?? "0";
      // Optimistically update previousLiquidity with newAmount
      const newAmount =
        BigInt(previousLiquidity) + BigInt(newRequest.amountToSpend);
      queryClient.setQueryData(
        ["balance", account?.address, config.NEXT_PUBLIC_FUSDC_ADDR],
        () => newAmount.toString(),
      );

      // handle balance
      await queryClient.cancelQueries({
        queryKey: ["balance", account?.address, config.NEXT_PUBLIC_FUSDC_ADDR],
      });
      const previousBalance =
        queryClient.getQueryData<string>([
          "balance",
          account?.address,
          config.NEXT_PUBLIC_FUSDC_ADDR,
        ]) ?? "0";
      // Optimistically update the cache if previousBalance
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
      return { previousLiquidity, previousBalance };
    },
    onError: (err, newRequest, context) => {
      if (context?.previousLiquidity) {
        queryClient.setQueryData(
          ["userLiquidity", account?.address, tradingAddr],
          context.previousLiquidity,
        );
      }
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
  const { mutateAsync: requestPaymasterOptimisticallyForRemove } = useMutation({
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
      // handle liquidity
      let previousLiquidity;
      if (newRequest.amountToSpend !== "0") {
        await queryClient.cancelQueries({
          queryKey: ["userLiquidity", account?.address, tradingAddr],
        });
        previousLiquidity =
          queryClient.getQueryData<string>([
            "userLiquidity",
            account?.address,
            tradingAddr,
          ]) ?? "0";
        // Optimistically update the cache if previousBalance
        if (previousLiquidity !== "0") {
          const leftAmount =
            BigInt(previousLiquidity) - BigInt(newRequest.amountToSpend);
          const amount = leftAmount > BigInt(0) ? leftAmount : BigInt(0);
          queryClient.setQueryData(
            ["userLiquidity", account?.address, tradingAddr],
            () => amount.toString(),
          );
        }
      }

      // handle balance
      // TODO for remove we should estimate what to return first
      await queryClient.cancelQueries({
        queryKey: ["balance", account?.address, config.NEXT_PUBLIC_FUSDC_ADDR],
      });
      const previousBalance =
        queryClient.getQueryData<string>([
          "balance",
          account?.address,
          config.NEXT_PUBLIC_FUSDC_ADDR,
        ]) ?? "0";
      // Optimistically update previousLiquidity with newAmount
      const newAmount =
        BigInt(previousBalance) + BigInt(newRequest.amountToSpend);
      queryClient.setQueryData(
        ["balance", account?.address, config.NEXT_PUBLIC_FUSDC_ADDR],
        () => newAmount.toString(),
      );

      // Return context to roll back
      return { previousLiquidity, previousBalance };
    },
    onError: (err, newRequest, context) => {
      if (context?.previousLiquidity) {
        queryClient.setQueryData(
          ["userLiquidity", account?.address, tradingAddr],
          context.previousLiquidity,
        );
      }
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
  const add = async (account: Account, fusdc: string) =>
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
            // openFundModal(); funding dialog can be added later
            throw new Error("You dont have enough USDC.");
          }
          const result = await requestPaymasterOptimisticallyForAdd({
            amountToSpend: amount.toString(),
            outcome: idempotentOutcome,
            opType: "ADD_LIQUIDITY",
            tradingAddr: tradingAddr,
            outgoingChainEid: 0,
            minimumBack: "0",
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              data,
              opType: "ADD_LIQUIDITY",
              account,
            });
            track(EVENTS.ADD_LIQUIDITY, {
              wallet: account.address,
              amount: result.amount,
              type: "addLiquidityWithPaymaster",
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
        loading: "Adding liquidity...",
        success: "Liquidity added successfully!",
        error: (e) => `${e?.shortMessage ?? e?.message ?? "Unknown error"}`,
      },
    );
  const remove = async (
    account: Account,
    fusdc: string,
    totalLiquidity: number,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const _fusdc = toUnits(fusdc, config.contracts.decimals.shares);
          const diff = BigInt(totalLiquidity) - _fusdc;
          const amount =
            BigInt(1e6) > diff ? BigInt(totalLiquidity) - BigInt(1e6) : _fusdc; // always 1 usdc should be secured in liquidity pool

          const result = await requestPaymasterOptimisticallyForRemove({
            amountToSpend: amount.toString(),
            outcome: idempotentOutcome,
            opType: "REMOVE_LIQUIDITY",
            tradingAddr: tradingAddr,
            outgoingChainEid: 0,
            minimumBack: "0",
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              data,
              opType: "REMOVE_LIQUIDITY",
              account,
            });
            track(EVENTS.REMOVE_LIQUIDITY, {
              wallet: account.address,
              amount: result.amount,
              type: "removeLiquidityWithPaymaster",
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
        loading: "Removing liquidity...",
        success: "Liquidity removed successfully!",
        error: (e) => `${e?.shortMessage ?? e?.message ?? "Unknown error"}`,
      },
    );
  const claim = async (account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const result = await requestPaymasterOptimisticallyForRemove({
            amountToSpend: "0",
            outcome: idempotentOutcome,
            opType: "REMOVE_LIQUIDITY",
            tradingAddr: tradingAddr,
            outgoingChainEid: 0,
            minimumBack: "0",
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              data,
              opType: "REMOVE_LIQUIDITY",
              account,
            });
            track(EVENTS.REMOVE_LIQUIDITY, {
              wallet: account.address,
              amount: result.amount,
              type: "claimLiquidityWithPaymaster",
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
        loading: "Removing liquidity...",
        success: "Liquidity removed successfully!",
        error: (e) => `${e?.shortMessage ?? e?.message ?? "Unknown error"}`,
      },
    );

  return { add, remove, claim };
};

export default useLiquidityWithPaymaster;
