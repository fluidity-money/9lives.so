import config from "@/config";
import { EVENTS, track } from "@/utils/analytics";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useWriteContract } from "wagmi";

export default function useClaimAllFees() {
  const { mutateAsync: writeContract } = useWriteContract();
  const claim = useCallback(
    async (poolAddresses: string[], walletAddress?: string) => {
      return toast.promise<string[] | undefined>(
        new Promise(async (res, rej) => {
          try {
            await writeContract({
              ...config.contracts.claimantHelper,
              account: walletAddress as `0x${string}`,
              functionName: "claim",
              args: [poolAddresses as `0x${string}`[]],
              chainId: config.destinationChain.id,
            });
            track(EVENTS.CLAIM_ALL_FEES, {
              poolAddresses,
            });
            res([]);
          } catch (e) {
            rej(e);
          }
        }),
        {
          loading: "Claiming fees...",
          success: "Fees claimed successfully!",
          error: "Failed to claim.",
        },
      );
    },
    [writeContract],
  );
  return { claim };
}
