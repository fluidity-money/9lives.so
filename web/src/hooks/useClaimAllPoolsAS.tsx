import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UnclaimedCampaign } from "@/types";
import { ninelivesClaimAll } from "@/providers/graphqlClient";
import { checkAndSetSecret, getSecret } from "./useAccount";
import { useSignMessage } from "wagmi";
import useConnectWallet from "./useConnectWallet";
export default function useClaimAllPoolsWithAS(
  data: UnclaimedCampaign[],
  closeModal?: () => void,
  token?: string,
) {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessage } = useSignMessage()
  const { connect } = useConnectWallet()
  return useMutation<string, Error, { addresses: string[]; walletAddress: string }>({
    mutationKey: ["claimAllPools"],
    mutationFn: async ({ addresses, walletAddress }) => {
      if (!walletAddress) return connect();
      let secret = await checkAndSetSecret(walletAddress, signMessage);
      if (!secret) throw new Error("No secret is set");
      let result = (await ninelivesClaimAll({
        secret,
        eoaAddress: walletAddress,
        markets: addresses,
      })) as any;
      if (result?.response?.status === 401) {
        const newSecret = await getSecret(walletAddress, signMessage);
        result = await ninelivesClaimAll({
          secret: newSecret,
          eoaAddress: walletAddress,
          markets: addresses,
        });
      }
      return result?.data?.claimRewards;
    },
    onMutate({ addresses }) {
      toast.loading("Claiming all rewards...", { id: addresses.join("") });
    },
    onError: (e, { addresses }) => {
      toast.error(`Claim error: ${e.message}`, { id: addresses.join("") });
    },
    onSuccess: (d, { walletAddress, addresses }) => {
      closeModal?.();
      toast.success(`Claimed successfuly.`, { id: addresses.join("") });
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
          queryKey: ["positions", c.poolAddress, c.outcomes, walletAddress, false],
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
