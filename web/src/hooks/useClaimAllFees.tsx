import config from "@/config";
import { EVENTS, track } from "@/utils/analytics";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { usePublicClient, useWriteContract } from "wagmi";

export default function useClaimAllFees() {
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const publicClient = usePublicClient()
  const { mutateAsync: writeContract } = useWriteContract()
  const claim = useCallback(
    async (
      poolAddresses: string[],
      simulate: boolean = false,
    ) => {

      return toast.promise<string[] | undefined>(
        new Promise(async (res, rej) => {
          try {
            await checkAndSwitchChain();
            if (simulate) {
              const simulation = await publicClient?.simulateContract({
                ...config.contracts.claimantHelper,
                functionName: "claim",
                args: [poolAddresses as `0x${string}`[]]
              })
              return simulation?.result;
            }
            await writeContract({
              ...config.contracts.claimantHelper,
              functionName: "claim",
              args: [poolAddresses as `0x${string}`[]]
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
    [checkAndSwitchChain],
  );
  const checkClaimFees = useCallback(
    async (poolAddress: string) => {
      const fees = await claim([poolAddress], true);
      return BigInt(fees?.[0] ?? 0);
    },
    [claim],
  );

  return { claim, checkClaimFees };
}
