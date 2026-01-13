import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignInput, SettlementType } from "@/types";
import { useRouter } from "next/navigation";
import { requestCreateCampaign } from "@/providers/graphqlClient";
import { useCampaignStore } from "@/stores/campaignStore";
import clientEnv from "../config/clientEnv";
import { generateCampaignId, generateOutcomeId } from "@/utils/generateId";
import helperAbi from "@/config/abi/helperFactory";
import { EVENTS, track } from "@/utils/analytics";
import { useAppKitAccount } from "@reown/appkit/react";
import useConnectWallet from "./useConnectWallet";
import { usePublicClient, useWriteContract } from "wagmi";
import { parseUnits, zeroAddress } from "viem";
import { useAllowanceCheck } from "./useAllowanceCheck";
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
  const account = useAppKitAccount()
  const { connect } = useConnectWallet()
  const publicClient = usePublicClient()
  const upsertCampaign = useCampaignStore((s) => s.upsertCampaign);
  const draftCampaigns = useCampaignStore((s) => s.campaigns);
  const minOracleCreatePrice = BigInt(4e6);
  const minDefaultCreatePrice = BigInt(3e6);
  const { checkAndAprove } = useAllowanceCheck()
  const { mutateAsync: writeContract } = useWriteContract()
  const create = async (
    { seedLiquidity, ...input }: CampaignInput,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) return connect()
          if (!publicClient) throw new Error("Public client is not set")
          await requestCreateCampaign({
            ...input,
            starting: Math.floor(new Date(input.starting).getTime() / 1000),
            ending: Math.floor(new Date(input.ending).getTime() / 1000),
            creator: account.address,
            isFake: true,
          });
          const userBalance = await publicClient.readContract({
            ...config.contracts.fusdc,
            functionName: "balanceOf",
            args: [account.address as `0x${string}`],
          })
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
            const seedLiquidityBigInt = parseUnits(
              seedLiquidity.toString(),
              config.contracts.decimals.fusdc,
            );
            await checkAndAprove({
              contractAddress: config.contracts.fusdc.address,
              spenderAddress: clientEnv.NEXT_PUBLIC_HELPER_FACTORY_ADDR,
              address: account.address,
              amount: seedLiquidityBigInt
            })
            const defaultFee = BigInt(10);
            const zeroFee = BigInt(0);
            const feeLp = BigInt(20);

            await writeContract({
              ...config.contracts.helperFactory,
              functionName: settlementFunctionMap[input.settlementType],
              args: [
                {
                  oracle: zeroAddress,
                  outcomes: creationList,
                  timeEnding: BigInt(
                    Math.floor(new Date(input.ending).getTime() / 1000),
                  ),
                  documentation: hashedDocumentation,
                  feeRecipient: account.address as `0x$${string}`,
                  feeCreator: defaultFee,
                  feeLp,
                  feeMinter: zeroFee,
                  feeReferrer: defaultFee,
                  seedLiquidity: seedLiquidityBigInt,
                  isDppm: false,
                },
              ],
            });
            // upsert campaign if on-chain campaign is created
            // so backend creation can be retried again
            upsertCampaign({ ...input, seedLiquidity });
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
          track(EVENTS.CAMPAIGN_CREATE, {
            seedLiquidity: seedLiquidity,
            name: input.name,
            type: "createWithContract",
            campaignId,
            outcomeCount: input.outcomes.length,
            settlementType: input.settlementType,
          });
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
