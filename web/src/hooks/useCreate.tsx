import config from "@/config";
import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  ZERO_ADDRESS,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignInput, SettlementType } from "@/types";
import { useRouter } from "next/navigation";
import { requestCreateCampaign } from "@/providers/graphqlClient";
import { useCampaignStore } from "@/stores/campaignStore";
import clientEnv from "../config/clientEnv";
import { generateCampaignId, generateOutcomeId } from "@/utils/generateId";
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
type Create =
  // | "createWithInfraMarket"
  "createWithAI" | "createWithBeautyContest";
type FunctionNames = ExtractNames<(typeof helperAbi)[number]> & Create;
const settlementFunctionMap: Record<
  Exclude<SettlementType, "CONTRACT" | "ORACLE">,
  FunctionNames
> = {
  // ORACLE: "createWithInfraMarket",
  AI: "createWithAI",
  POLL: "createWithBeautyContest",
};
const useCreate = ({ openFundModal }: { openFundModal: () => void }) => {
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
          await requestCreateCampaign({
            ...input,
            starting: Math.floor(new Date(input.starting).getTime() / 1000),
            ending: Math.floor(new Date(input.ending).getTime() / 1000),
            creator: account.address,
            isFake: true,
          });
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
              if (minOracleCreatePrice > userBalance) {
                openFundModal();
                throw new Error("You dont have enough USDC.");
              }
            default:
              if (minDefaultCreatePrice > userBalance) {
                openFundModal();
                throw new Error("You dont have enough USDC.");
              }
          }
          const campaignId = generateCampaignId(
            input.name,
            input.desc,
            input.seed,
          );
          const draftCampaign = draftCampaigns.find((c) => c.id === campaignId);
          if (!draftCampaign) {
            const creationList = input.outcomes.map((o) => ({
              identifier: generateOutcomeId(o.name, o.seed),
              sqrtPrice: BigInt(79228162514264337593543950336), // with $1 for each outcome
              name: input.name.slice(0, 8) + o.name,
            }));
            let hashedDocumentation: `0x${string}` = `0x${"0".repeat(64)}`;
            if (input.settlementType === "CONTRACT")
              throw new Error("Contract settlement is not supported yet");
            if (input.settlementType === "ORACLE")
              throw new Error("ORACLE settlement is not supported yet");
            // if (input.settlementType === "ORACLE" && input.oracleDescription) {
            //   const descBytes = toUtf8Bytes(input.oracleDescription);
            //   hashedDocumentation = keccak256(descBytes) as `0x${string}`;
            // }
            const createTx = prepareContractCall({
              contract: config.contracts.helperFactory,
              method: settlementFunctionMap[input.settlementType],
              params: [
                {
                  oracle: ZERO_ADDRESS,
                  outcomes: creationList,
                  timeEnding: BigInt(
                    Math.floor(new Date(input.ending).getTime() / 1000),
                  ),
                  documentation: hashedDocumentation,
                  feeRecipient: account.address,
                  feeCreator: BigInt(0),
                  feeLp: BigInt(0),
                  feeMinter: BigInt(0),
                  feeReferrer: BigInt(0),
                  seedLiquidity: BigInt(0),
                },
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
            starting: Math.floor(new Date(input.starting).getTime() / 1000),
            ending: Math.floor(new Date(input.ending).getTime() / 1000),
            creator: account.address,
            isFake: false,
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
        error: (e: unknown) =>
          `Create failed. ${e instanceof Error ? e.message : e instanceof String ? e : `Unknown error: ${JSON.stringify(e)}`}`,
      },
    );
  return { create };
};
export default useCreate;
