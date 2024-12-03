import config from "@/config";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { keccak256 } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignInput } from "@/types";
import { useRouter } from "next/navigation";
import { requestCreateCampaign } from "@/providers/graphqlClient";
import { useCampaignStore } from "@/stores/campaignStore";

const useCreate = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const upsertCampaign = useCampaignStore((s) => s.upsertCampaign);
  const draftCampaigns = useCampaignStore((s) => s.campaigns);
  const create = async (input: CampaignInput, account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const draftCampaign = draftCampaigns.find((c) => c.id === input.id);
          if (!draftCampaign) {
            const creationList = input.outcomes.map((o) => ({
              identifier: o.id!,
              sqrtPrice: BigInt(79228162514264337593543950336), // with $1 for each outcome
              name: o.name,
            }));
            const hashedUrl = keccak256(input.urlCommitee) as `0x${string}`;
            const createTx = prepareContractCall({
              contract: config.contracts.helper,
              method: "createWithInfraMarket",
              params: [
                creationList, // outcomes
                BigInt(0), // time ending
                hashedUrl, // documentation url committee
                account.address, // fee recipient
              ],
            });
            await sendTransaction({
              transaction: createTx,
              account,
            });
            // upsert campaign if on-chain campaign is created
            // so backend creation can be retried again
            upsertCampaign(input);
          }
          await requestCreateCampaign({
            ...input,
            starting: new Date(input.starting).getTime(),
            ending: new Date(input.ending).getTime(),
            creator: account.address,
          });
          queryClient.invalidateQueries({
            queryKey: ["campaigns"],
          });
          router.replace("/");
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Creating campaign...",
        success: "Campaign created successfully!",
        error: "Failed to create.",
      },
    );
  return { create };
};
export default useCreate;
