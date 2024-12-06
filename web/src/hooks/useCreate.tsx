import config from "@/config";
import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import { keccak256, MaxUint256, toUtf8Bytes } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignInput } from "@/types";
import { useRouter } from "next/navigation";
import { requestCreateCampaign } from "@/providers/graphqlClient";
import { useCampaignStore } from "@/stores/campaignStore";
import clientEnv from "../config/clientEnv";
import { generateId } from "@/utils/generateId";
const approveFactoryTx = prepareContractCall({
  contract: config.contracts.fusdc,
  method: "approve",
  params: [clientEnv.NEXT_PUBLIC_FACTORY_ADDR, MaxUint256],
});
const approveInfraTx = prepareContractCall({
  contract: config.contracts.fusdc,
  method: "approve",
  params: [clientEnv.NEXT_PUBLIC_INFRA_ORACLE_ADDR, MaxUint256],
});
const approveHelperTx = prepareContractCall({
  contract: config.contracts.fusdc,
  method: "approve",
  params: [clientEnv.NEXT_PUBLIC_HELPER_ADDR, MaxUint256],
});
const useCreate = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const upsertCampaign = useCampaignStore((s) => s.upsertCampaign);
  const draftCampaigns = useCampaignStore((s) => s.campaigns);
  const create = async (input: CampaignInput, account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const campaignId = generateId(input.name, input.desc, input.seed);
          const draftCampaign = draftCampaigns.find((c) => c.id === campaignId);
          if (!draftCampaign) {
            const creationList = input.outcomes.map((o) => ({
              identifier: generateId(o.name, o.description, o.seed),
              sqrtPrice: BigInt(79228162514264337593543950336), // with $1 for each outcome
              name: o.name,
            }));
            const descBytes = toUtf8Bytes(input.oracleDescription);
            const hashedOracleDesc = keccak256(descBytes) as `0x${string}`;
            const createTx = prepareContractCall({
              contract: config.contracts.helper,
              method: "createWithInfraMarket",
              params: [
                creationList, // outcomes
                BigInt(new Date(input.ending).getTime() * 1000), // time ending in seconds timestamp
                hashedOracleDesc, // documentation (oracle description)
                account.address, // fee recipient
              ],
            });
            const allowanceFactoryTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "allowance",
              params: [account.address, clientEnv.NEXT_PUBLIC_FACTORY_ADDR],
            });
            const allowanceInfraTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "allowance",
              params: [
                account.address,
                clientEnv.NEXT_PUBLIC_INFRA_ORACLE_ADDR,
              ],
            });
            const allowanceHelperTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "allowance",
              params: [account.address, clientEnv.NEXT_PUBLIC_HELPER_ADDR],
            });
            const allowanceOfFactory = (await simulateTransaction({
              transaction: allowanceFactoryTx,
              account,
            })) as bigint;
            if (!(allowanceOfFactory > 0)) {
              await sendTransaction({
                transaction: approveFactoryTx,
                account,
              });
            }
            const allowanceOfInfra = (await simulateTransaction({
              transaction: allowanceInfraTx,
              account,
            })) as bigint;
            if (!(allowanceOfInfra > 0)) {
              await sendTransaction({
                transaction: approveInfraTx,
                account,
              });
            }
            const allowanceOfHelper = (await simulateTransaction({
              transaction: allowanceHelperTx,
              account,
            })) as bigint;
            if (!(allowanceOfHelper > 0)) {
              await sendTransaction({
                transaction: approveHelperTx,
                account,
              });
            }
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
          router.replace(`/campaign/${campaignId}`);
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
