import config from "@/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useCheckAndSwitchChain from "./useCheckAndSwitchChain";
import { UnclaimedCampaign } from "@/types";
import { useWriteContract } from "wagmi";

export default function useClaimAllPools(
  data: UnclaimedCampaign[],
  closeModal?: () => void,
  token?: string,
) {
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const queryClient = useQueryClient();
  const { mutateAsync: writeContract } = useWriteContract();
  return useMutation<
    `0x${string}`,
    Error,
    { addresses: string[]; walletAddress: string }
  >({
    mutationKey: ["claimAllPools"],
    mutationFn: async ({ addresses }) => {
      await checkAndSwitchChain();
      const reciept = await writeContract({
        ...config.contracts.claimantHelper,
        functionName: "payoff",
        args: [addresses as `0x${string}`[]],
      });
      return reciept;
    },
    onMutate({ addresses }) {
      toast.loading("Claiming all rewards...", { id: addresses.join("") });
    },
    onError: (e, { addresses }) => {
      toast.error(`Claim error: ${e.message}`, { id: addresses.join("") });
    },
    onSuccess: (d, { walletAddress, addresses }) => {
      closeModal?.();
      toast.success(`Claimed successfuly. ${d.slice(0, 4)}...${d.slice(-4)}`, {
        id: addresses.join(""),
      });
      queryClient.setQueryData(
        ["unclaimedCampaigns", walletAddress, token],
        [],
      );
      data.forEach((c) => {
        queryClient.invalidateQueries({
          queryKey: [
            "dppmShareEstimationForAll",
            c.poolAddress,
            walletAddress,
            true,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "dppmShareEstimationForAll",
            c.poolAddress,
            walletAddress,
            false,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "positions",
            c.poolAddress,
            c.outcomes,
            walletAddress,
            false,
          ],
        });

        queryClient.invalidateQueries({
          queryKey: ["participatedCampaigns", walletAddress, c.identifier],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "positionHistory",
            walletAddress,
            c.outcomes.map((o) => o.identifier),
          ],
        });
      });

      data.forEach((c) =>
        c.outcomes.forEach((o) => {
          queryClient.invalidateQueries({
            queryKey: [
              "dppmShareEstimation",
              c.poolAddress,
              walletAddress,
              o.identifier,
            ],
          });
        }),
      );
    },
  });
}
