import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { EVENTS, track } from "@/utils/analytics";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  toUnits,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
import { useAllowanceCheck } from "./useAllowanceCheck";

export default function useLiquidity({
  tradingAddr,
  campaignId,
}: {
  tradingAddr: `0x${string}`;
  campaignId: `0x${string}`;
}) {
  const queryClient = useQueryClient();
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: config.thirdweb.client,
    chain: config.chains.currentChain,
  });
  const { checkAndAprove } = useAllowanceCheck();
  const add = async (account: Account, fusdc: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const amount = toUnits(fusdc, config.contracts.decimals.shares);
          await checkAndAprove({
            contractAddress: config.contracts.fusdc.address,
            spenderAddress: tradingAddr,
            account,
            amount,
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
          queryClient.invalidateQueries({
            queryKey: ["userLiquidity", account.address, tradingAddr],
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
            queryKey: ["userLiquidity", account.address, tradingAddr],
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
  const claim = async (account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const claimLiquidityTx = prepareContractCall({
            contract: tradingContract,
            method: "claimLiquidity9C391F85",
            params: [account.address],
          });
          await sendTransaction({
            transaction: claimLiquidityTx,
            account,
          });
          queryClient.invalidateQueries({
            queryKey: ["userLiquidity", account.address, tradingAddr],
          });
          track(EVENTS.CLAIM_LIQUIDITY, {
            wallet: account.address,
            tradingAddr,
            campaignId,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Claiming liquidity...",
        success: "Liquidity claimed successfully!",
        error: "Failed to claim.",
      },
    );
  return { add, remove, claim };
}
