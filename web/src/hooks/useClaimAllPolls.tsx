import config from "@/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Chain,
  Hex,
  prepareContractCall,
  sendTransaction,
  ThirdwebClient,
} from "thirdweb";
import useCheckAndSwitchChain from "./useCheckAndSwitchChain";
import { Account } from "thirdweb/wallets";
import { UnclaimedCampaign } from "@/types";

export default function useClaimAllPools(
  data: UnclaimedCampaign[],
  token: string,
) {
  const toastId = crypto.randomUUID();
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const queryClient = useQueryClient();
  return useMutation<
    {
      readonly transactionHash: Hex;
      client: ThirdwebClient;
      chain: Chain;
      maxBlocksWaitTime?: number | undefined;
    },
    Error,
    { addresses: string[]; account: Account }
  >({
    mutationKey: ["claimAllPools"],
    mutationFn: async ({ addresses, account }) => {
      const claimAllPoolsTx = prepareContractCall({
        contract: config.contracts.claimantHelper,
        method: "payoff",
        params: [addresses],
      });
      await checkAndSwitchChain();
      return await sendTransaction({ transaction: claimAllPoolsTx, account });
    },
    onMutate() {
      toast.loading("Claiming all rewards...", { id: toastId });
    },
    onError: (e) => {
      toast.error(`Claim error: ${e.message}`, { id: toastId });
    },
    onSuccess: (d, { account }) => {
      toast.success(
        `Claimed successfuly. Tx hash ${d.transactionHash.slice(0, 4)}...${d.transactionHash.slice(-4)}`,
        { id: toastId },
      );
      queryClient.invalidateQueries({
        queryKey: ["unclaimedCampaigns", account.address, token],
      });
      data.forEach((i) => {
        queryClient.invalidateQueries({
          queryKey: ["positions", i.poolAddress, i.outcomes, account, false],
        });
      });
    },
  });
}
