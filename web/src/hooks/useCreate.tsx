import config from "@/config";
import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import { keccak256, toUtf8Bytes } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignInput, SettlementType } from "@/types";
import { useRouter } from "next/navigation";
import { requestCreateCampaign } from "@/providers/graphqlClient";
import { useCampaignStore } from "@/stores/campaignStore";
import clientEnv from "../config/clientEnv";
import { generateId } from "@/utils/generateId";
import helperAbi from "@/config/abi/helperFactory";
// HelperApprovalAmount taken by the contract for every deployment (in the current
// two outcome DPM mode).
const HelperApprovalAmount = BigInt(5000000);
const approveHelperTx = prepareContractCall({
  contract: config.contracts.fusdc,
  method: "approve",
  params: [clientEnv.NEXT_PUBLIC_HELPER_FACTORY_ADDR, HelperApprovalAmount],
});
type ExtractNames<T> = T extends { name: infer N } ? N : never;
type FunctionNames = ExtractNames<(typeof helperAbi)[number]>;
const settlementFunctionMap: Record<
  Exclude<SettlementType, "CONTRACT">,
  FunctionNames
> = {
  ORACLE: "createWithInfraMarket",
  AI: "createWithAI",
  POLL: "createWithBeautyContest",
};
const useCreate = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const upsertCampaign = useCampaignStore((s) => s.upsertCampaign);
  const draftCampaigns = useCampaignStore((s) => s.campaigns);
  const minOracleCreatePrice = BigInt(4e6);
  const minDefaultCreatePrice = BigInt(3e6);
  const create = async (input: CampaignInput, account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const userBalanceTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "balanceOf",
            params: [account?.address],
          });
          const userBalance = await simulateTransaction({
            transaction: userBalanceTx,
            account,
          });
          switch (input.settlementType) {
            case "ORACLE":
              if (minOracleCreatePrice > userBalance)
                throw new Error("You dont have enough USDC.");
            default:
              if (minDefaultCreatePrice > userBalance)
                throw new Error("You dont have enough USDC.");
          }
          const campaignId = generateId(input.name, input.desc, input.seed);
          const draftCampaign = draftCampaigns.find((c) => c.id === campaignId);
          if (!draftCampaign) {
            const creationList = input.outcomes.map((o) => ({
              identifier: generateId(o.name, o.description, o.seed),
              sqrtPrice: BigInt(79228162514264337593543950336), // with $1 for each outcome
              name: input.name.slice(0, 8) + o.name,
            }));
            let hashedDocumentation: `0x${string}` = `0x${"0".repeat(64)}`;
            if (input.settlementType === "CONTRACT")
              throw new Error("Contract settlement is not supported yet");
            if (input.settlementType === "ORACLE" && input.oracleDescription) {
              const descBytes = toUtf8Bytes(input.oracleDescription);
              hashedDocumentation = keccak256(descBytes) as `0x${string}`;
            }
            const createTx = prepareContractCall({
              contract: config.contracts.helperFactory,
              method: settlementFunctionMap[input.settlementType],
              params: [
                creationList, // outcomes
                BigInt(new Date(input.ending).getTime() * 1000), // time ending in seconds timestamp
                hashedDocumentation, // documentation (settlement description)
                account.address, // fee recipient
              ],
            });
            const allowanceHelperTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "allowance",
              params: [
                account.address,
                clientEnv.NEXT_PUBLIC_HELPER_FACTORY_ADDR,
              ],
            });
            const allowanceOfHelper = (await simulateTransaction({
              transaction: allowanceHelperTx,
              account,
            })) as bigint;
            if (allowanceOfHelper < HelperApprovalAmount) {
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
