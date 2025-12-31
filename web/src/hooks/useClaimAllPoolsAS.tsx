import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Account } from "thirdweb/wallets";
import { UnclaimedCampaign } from "@/types";
import { ninelivesClaimAll } from "@/providers/graphqlClient";
import { checkAndSetSecret, getSecret } from "./useAccount";
export default function useClaimAllPoolsWithAS(
  data: UnclaimedCampaign[],
  closeModal?: () => void,
  token?: string,
) {
  const queryClient = useQueryClient();
  return useMutation<string, Error, { addresses: string[]; account: Account }>({
    mutationKey: ["claimAllPools"],
    mutationFn: async ({ addresses, account }) => {
      if (!account) throw new Error("No wallet is connected");
      let secret = await checkAndSetSecret(account);
      if (!secret) throw new Error("No secret is set");
      let result = (await ninelivesClaimAll({
        secret,
        eoaAddress: account.address,
        markets: addresses,
      })) as any;
      if (result?.response?.status === 401) {
        const newSecret = await getSecret(account);
        result = await ninelivesClaimAll({
          secret: newSecret,
          eoaAddress: account.address,
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
    onSuccess: (d, { account, addresses }) => {
      closeModal?.();
      toast.success(`Claimed successfuly.`, { id: addresses.join("") });
      queryClient.setQueryData(
        ["unclaimedCampaigns", account.address, token],
        [],
      );
      data.forEach((c) => {
        queryClient.invalidateQueries({
          queryKey: [
            "dppmShareEstimationForAll",
            c.poolAddress,
            account?.address,
            true,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "dppmShareEstimationForAll",
            c.poolAddress,
            account?.address,
            false,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: ["positions", c.poolAddress, c.outcomes, account, false],
        });

        queryClient.invalidateQueries({
          queryKey: ["participatedCampaigns", account?.address, c.identifier],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "positionHistory",
            account.address,
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
              account?.address,
              o.identifier,
            ],
          });
        }),
      );
    },
  });
}
