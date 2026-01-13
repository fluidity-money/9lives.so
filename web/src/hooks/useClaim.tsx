import tradingAbi from "@/config/abi/trading";
import tradingDpmAbi from "@/config/abi/tradingDpm";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useAllowanceCheck } from "./useAllowanceCheck";
import { useWriteContract } from "wagmi";

const useClaim = ({
  shareAddr,
  tradingAddr,
  outcomeId,
  outcomes,
  isDpm,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  outcomes: Outcome[];
  isDpm: boolean | null;
}) => {
  const queryClient = useQueryClient();
  const removePosition = usePortfolioStore((s) => s.removePositionValue);
  const { checkAndAprove } = useAllowanceCheck();
  const { mutateAsync: writeContract } = useWriteContract()
  const claim = async (address: string, accountShare?: bigint) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!accountShare || isNaN(Number(accountShare)))
            throw new Error("Invalid winning shares");

          await checkAndAprove({
            contractAddress: shareAddr,
            spenderAddress: tradingAddr,
            address,
            amount: accountShare,
          });

          if (isDpm) {
            await writeContract({
              abi: tradingDpmAbi,
              address: tradingAddr,
              functionName: "payoff91FA8C2E",
              args: [outcomeId, accountShare, address as `0x${string}`],
            });
          } else {
            await writeContract({
              abi: tradingAbi,
              address: tradingAddr,
              functionName: "payoffCB6F2565",
              args: [outcomeId, accountShare, address as `0x${string}`],
            })
          }

          const outcomeIds = outcomes.map((outcome) => outcome.identifier);
          removePosition(outcomeId);
          queryClient.invalidateQueries({
            queryKey: ["positions", tradingAddr, outcomes, address, isDpm],
          });
          queryClient.invalidateQueries({
            queryKey: ["positionHistory", address, outcomeIds],
          });
          track(EVENTS.CLAIM_REWARD, {
            amount: accountShare,
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
        loading: "Claiming reward...",
        success: "Reward claimed successfully!",
        error: "Failed to claim.",
      },
    );
  return { claim };
};
export default useClaim;
