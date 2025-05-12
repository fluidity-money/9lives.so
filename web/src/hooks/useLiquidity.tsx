import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { EVENTS, track } from "@/utils/analytics";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  toUnits,
} from "thirdweb";
import { Account } from "thirdweb/wallets";

export default function useLiquidity({
  tradingAddr,
  campaignId,
}: {
  tradingAddr: `0x${string}`;
  campaignId: `0x${string}`;
}) {
  const queryClient = useQueryClient();
  const add = async (account: Account, fusdc: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const amount = toUnits(fusdc, config.contracts.decimals.shares);
          const balanceOfTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "balanceOf",
            params: [account.address],
          });
          const balance = await simulateTransaction({
            transaction: balanceOfTx,
            account: account,
          });
          if (amount > balance) {
            rej("Insufficient balance");
          }
          const allowanceTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "allowance",
            params: [account.address, tradingAddr],
          });
          const allowance = await simulateTransaction({
            transaction: allowanceTx,
            account: account,
          });
          if (amount > allowance) {
            const approveTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "approve",
              params: [tradingAddr, amount],
            });
            await sendTransaction({
              transaction: approveTx,
              account,
            });
          }
          const tradingContract = getContract({
            abi: tradingAbi,
            address: tradingAddr,
            client: config.thirdweb.client,
            chain: config.chains.currentChain,
          });
          const addLiquidityTx = prepareContractCall({
            contract: tradingContract,
            method: "addLiquidityA975D995",
            params: [amount, account.address],
          });
          await sendTransaction({
            transaction: addLiquidityTx,
            account,
          });
          queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId],
          });
          track(EVENTS.ADD_LIQUIDITY, {
            wallet: account.address,
            amount,
            tradingAddr,
            campaignId,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Adding liquidity...",
        success: "Liquidity added successfully!",
        error: "Failed to add.",
      },
    );
  const remove = async (account: Account, fusdc: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const amount = toUnits(fusdc, config.contracts.decimals.shares);
          const tradingContract = getContract({
            abi: tradingAbi,
            address: tradingAddr,
            client: config.thirdweb.client,
            chain: config.chains.currentChain,
          });
          const removeLiquidityTx = prepareContractCall({
            contract: tradingContract,
            method: "removeLiquidity3C857A15",
            params: [amount, account.address],
          });
          await sendTransaction({
            transaction: removeLiquidityTx,
            account,
          });
          queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId],
          });
          track(EVENTS.REMOVE_LIQUIDITY, {
            wallet: account.address,
            amount,
            tradingAddr,
            campaignId,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Removing liquidity...",
        success: "Liquidity removed successfully!",
        error: "Failed to remove.",
      },
    );
  return { add, remove };
}
