import config from "@/config";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { keccak256 } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignInput, OutcomeInput } from "@/types";
import { useRouter } from "next/router";
import { requestCreateCampaign } from "@/providers/graphqlClient";
import { useCampaignStore } from "@/stores/campaignStore";

const useCreate = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const upsertCampaign = useCampaignStore((s) => s.upsertCampaign);
  const create = async (
    input: CampaignInput,
    account: Account,
    amounts: number[],
    outcomes: OutcomeInput[],
    urlCommittee: string,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const creationList = outcomes.map((o, idx) => ({
            identifier: o.id!,
            amount: toUnits(
              amounts[idx].toString(),
              config.contracts.decimals.fusdc,
            ),
          }));
          const hashedUrl = keccak256(urlCommittee) as `0x${string}`;
          const createTx = prepareContractCall({
            contract: config.contracts.factory,
            method: "newTradingC11AAA3B",
            params: [
              creationList,
              config.NEXT_PUBLIC_INFRA_ORACLE_ADDR,
              BigInt(0),
              BigInt(0),
              hashedUrl,
              account.address,
            ],
          });
          await sendTransaction({
            transaction: createTx,
            account,
          });
          // upsert campaign if on-chain campaign is created
          // so backend creation can be retried again
          upsertCampaign(input);
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
