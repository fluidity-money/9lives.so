import tradingAbi from "@/config/abi/trading";
import { Outcome } from "@/types";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useWriteContract } from "wagmi";

export default function useDppmClaimAll({
  tradingAddr,
  outcomes,
  campaignId,
}: {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  campaignId: `0x${string}`;
}) {
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const queryClient = useQueryClient();
  const { mutateAsync: writeContract } = useWriteContract();

  const claimAll = async (address: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          await checkAndSwitchChain();
          const response = await writeContract({
            abi: tradingAbi,
            address: tradingAddr,
            functionName: "dppmPayoffForAll58633B6E",
            args: [address as `0x${string}`],
          });
          queryClient.invalidateQueries({
            queryKey: ["dppmShareEstimationForAll", tradingAddr, address, true],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "dppmShareEstimationForAll",
              tradingAddr,
              address,
              false,
            ],
          });
          outcomes.forEach((o) => {
            queryClient.invalidateQueries({
              queryKey: [
                "dppmShareEstimation",
                tradingAddr,
                address,
                o.identifier,
              ],
            });
          });
          queryClient.invalidateQueries({
            queryKey: ["positions", tradingAddr, outcomes, address, false],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "positionHistory",
              address,
              outcomes.map((o) => o.identifier),
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["participatedCampaigns", address, campaignId],
          });
          res(response);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Claiming...",
        success: "Claimed successfully",
        error: (e: unknown) =>
          `Claim failed. ${e instanceof Error ? e.message : e instanceof String ? e : `Unknown error: ${JSON.stringify(e)}`}`,
      },
    );

  return { claimAll };
}
