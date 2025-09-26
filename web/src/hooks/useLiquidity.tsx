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
import { useAllowanceCheck } from "./useAllowanceCheck";
import { MaxUint256 } from "ethers";

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
    chain: config.destinationChain,
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
          const addLiquidityTx = (simulatedShare?: bigint) => {
            const minShares = simulatedShare
              ? (simulatedShare * BigInt(95)) / BigInt(100)
              : BigInt(0);
            const maxShares = simulatedShare
              ? (simulatedShare * BigInt(105)) / BigInt(100)
              : MaxUint256;
            return prepareContractCall({
              contract: tradingContract,
              method: "addLiquidityB9DDA952",
              params: [amount, account.address, minShares, maxShares],
            });
          };
          const simulatedShare = await simulateTransaction({
            transaction: addLiquidityTx(),
            account,
          });
          await sendTransaction({
            transaction: addLiquidityTx(simulatedShare),
            account,
          });
          queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId],
          });
          queryClient.invalidateQueries({
            queryKey: ["userLiquidity", account.address, tradingAddr],
          });
          track(EVENTS.ADD_LIQUIDITY, {
            amount,
            type: "addLiquidity",
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
            amount,
            type: "removeLiquidity",
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
            method: "removeLiquidity3C857A15",
            params: [BigInt(0), account.address],
          });
          const [lpedAmount, lpRewards] = await simulateTransaction({
            transaction: claimLiquidityTx,
            account,
          });
          if (
            BigInt(lpRewards) === BigInt(0) &&
            BigInt(lpedAmount) === BigInt(0)
          ) {
            throw new Error("You don't have anything to claim.");
          }
          await sendTransaction({
            transaction: claimLiquidityTx,
            account,
          });
          queryClient.invalidateQueries({
            queryKey: ["userLiquidity", account.address, tradingAddr],
          });
          track(EVENTS.REMOVE_LIQUIDITY, {
            amount: BigInt(0),
            type: "claimLiquidity",
            tradingAddr,
            campaignId,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Claiming liquidity and rewards...",
        success: "Liquidity claimed successfully!",
        error: (e) => e?.shortMessage ?? e?.message ?? "Failed to claim.",
      },
    );
  return { add, remove, claim };
}
