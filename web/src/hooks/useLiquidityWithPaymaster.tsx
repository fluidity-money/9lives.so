import config from "@/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignDetail } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import useRequestPaymaster from "./useRequestPaymaster";
import { usePaymasterStore } from "@/stores/paymasterStore";
import { useAppKitAccount } from "@reown/appkit/react";
import { parseUnits } from "viem";
import { usePublicClient } from "wagmi";
import useConnectWallet from "./useConnectWallet";

const useLiquidityWithPaymaster = ({ data }: { data: CampaignDetail }) => {
  const idempotentOutcome = "0x0000000000000000";
  const queryClient = useQueryClient();
  const account = useAppKitAccount();
  const { requestPaymaster } = useRequestPaymaster();
  const publicClient = usePublicClient();
  const { connect } = useConnectWallet();
  const createTicket = usePaymasterStore((s) => s.createTicket);
  const { mutateAsync: requestPaymasterOptimisticallyForAdd } = useMutation({
    mutationFn: ({
      amountToSpend,
      outcome,
      opType,
      minimumBack,
      outgoingChainEid,
    }: Omit<Parameters<typeof requestPaymaster>[0], "tradingAddr">) =>
      requestPaymaster({
        amountToSpend,
        outcome,
        opType,
        outgoingChainEid,
        tradingAddr: data.poolAddress,
        minimumBack,
      }),
    onMutate: async (newRequest) => {
      // handle liquidity
      await queryClient.cancelQueries({
        queryKey: ["userLiquidity", account?.address, data.poolAddress],
      });
      const previousLiquidity =
        queryClient.getQueryData<string>([
          "userLiquidity",
          account?.address,
          data.poolAddress,
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
          ["userLiquidity", account?.address, data.poolAddress],
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
      minimumBack,
      outgoingChainEid,
    }: Omit<Parameters<typeof requestPaymaster>[0], "tradingAddr">) =>
      requestPaymaster({
        amountToSpend,
        outcome,
        opType,
        outgoingChainEid,
        tradingAddr: data.poolAddress,
        minimumBack,
      }),
    onMutate: async (newRequest) => {
      // handle liquidity
      let previousLiquidity;
      if (newRequest.amountToSpend !== "0") {
        await queryClient.cancelQueries({
          queryKey: ["userLiquidity", account?.address, data.poolAddress],
        });
        previousLiquidity =
          queryClient.getQueryData<string>([
            "userLiquidity",
            account?.address,
            data.poolAddress,
          ]) ?? "0";
        // Optimistically update the cache if previousBalance
        if (previousLiquidity !== "0") {
          const leftAmount =
            BigInt(previousLiquidity) - BigInt(newRequest.amountToSpend);
          const amount = leftAmount > BigInt(0) ? leftAmount : BigInt(0);
          queryClient.setQueryData(
            ["userLiquidity", account?.address, data.poolAddress],
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
          ["userLiquidity", account?.address, data.poolAddress],
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
  const add = async (fusdc: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) return connect();
          if (!publicClient) throw new Error("Public client is not set");
          const amount = parseUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          );
          const userBalance = await publicClient.readContract({
            ...config.contracts.fusdc,
            functionName: "balanceOf",
            args: [account.address as `0x${string}`],
          });
          if (amount > userBalance) {
            // openFundModal(); funding dialog can be added later
            throw new Error("You dont have enough USDC.");
          }
          const result = await requestPaymasterOptimisticallyForAdd({
            amountToSpend: amount.toString(),
            outcome: idempotentOutcome,
            opType: "ADD_LIQUIDITY",
            outgoingChainEid: 0,
            minimumBack: "0",
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              data,
              opType: "ADD_LIQUIDITY",
              address: account.address,
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
  const remove = async (fusdc: string, totalLiquidity: number) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) return connect();
          const _fusdc = parseUnits(fusdc, config.contracts.decimals.shares);
          const diff = BigInt(totalLiquidity) - _fusdc;
          const amount =
            BigInt(1e6) > diff ? BigInt(totalLiquidity) - BigInt(1e6) : _fusdc; // always 1 usdc should be secured in liquidity pool

          const result = await requestPaymasterOptimisticallyForRemove({
            amountToSpend: amount.toString(),
            outcome: idempotentOutcome,
            opType: "REMOVE_LIQUIDITY",
            outgoingChainEid: 0,
            minimumBack: "0",
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              data,
              opType: "REMOVE_LIQUIDITY",
              address: account.address,
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
  const claim = async () =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account?.address) return connect();
          const result = await requestPaymasterOptimisticallyForRemove({
            amountToSpend: "0",
            outcome: idempotentOutcome,
            opType: "REMOVE_LIQUIDITY",
            outgoingChainEid: 0,
            minimumBack: "0",
          });
          if (result && result.ticketId) {
            createTicket({
              id: result.ticketId,
              amount: result.amount,
              data,
              opType: "REMOVE_LIQUIDITY",
              address: account.address,
            });
            track(EVENTS.REMOVE_LIQUIDITY, {
              amount: result.amount,
              type: "claimLiquidityWithPaymaster",
              tradingAddr: data.poolAddress,
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
