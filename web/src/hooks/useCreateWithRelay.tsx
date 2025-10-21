import config from "@/config";
import {
  encode,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  toUnits,
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
import { EVENTS, track } from "@/utils/analytics";
import { adaptViemWallet, getClient } from "@reservoir0x/relay-sdk";
import {
  useActiveWallet,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { viemAdapter } from "thirdweb/adapters/viem";
import RelayTxToaster from "@/components/relayTxToaster";
import formatFusdc from "@/utils/formatFusdc";
type ExtractNames<T> = T extends { name: infer N } ? N : never;
type Create =
  // | "createWithInfraMarket"
  "createWithAI" | "createWithBeautyContest";
type FunctionNames = ExtractNames<(typeof helperAbi)[number]> & Create;
type TradeType = "EXACT_INPUT" | "EXACT_OUTPUT" | "EXPECTED_OUTPUT";
const settlementFunctionMap: Record<
  Exclude<SettlementType, "CONTRACT" | "ORACLE">,
  FunctionNames
> = {
  // ORACLE: "createWithInfraMarket",
  AI: "createWithAI",
  POLL: "createWithBeautyContest",
};
const useCreateWithRelay = ({
  openFundModal,
}: {
  openFundModal: () => void;
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const upsertCampaign = useCampaignStore((s) => s.upsertCampaign);
  const draftCampaigns = useCampaignStore((s) => s.campaigns);
  const chain = useActiveWalletChain();
  const wallet = useActiveWallet();
  const switchChain = useSwitchActiveWalletChain();
  const minOracleCreatePrice = BigInt(4e6);
  const minDefaultCreatePrice = BigInt(3e6);
  const createWithRelay = async (
    { seedLiquidity, fromDecimals, ...input }: CampaignInput,
    account: Account,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!fromDecimals) throw new Error("fromDecimals is undefined");
          if (!wallet) throw new Error("No wallet is detected");
          if (!chain) throw new Error("No chain is detected");
          let usdValueBigInt = "0";
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

            const fromAmountBigInt = toUnits(
              seedLiquidity.toString(),
              fromDecimals,
            );
            const toAmountRes = await fetch("https://api.relay.link/quote", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user: account?.address,
                originChainId: input.fromChain,
                destinationChainId: input.toChain,
                originCurrency: input.fromToken,
                destinationCurrency: input.toToken,
                recipient: account?.address,
                referrer: "9lives.so",
                amount: fromAmountBigInt.toString(),
                tradeType: "EXACT_INPUT" as TradeType,
              }),
            });
            if (toAmountRes.status !== 200) {
              throw new Error("Selected token is not supported.");
            }
            const toAmountData = await toAmountRes.json();
            usdValueBigInt = toAmountData.details.currencyOut.amount;
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
            if (allowanceOfHelper < BigInt(usdValueBigInt)) {
              const approveHelperTx = prepareContractCall({
                contract: config.contracts.fusdc,
                method: "approve",
                params: [
                  clientEnv.NEXT_PUBLIC_HELPER_FACTORY_ADDR,
                  BigInt(usdValueBigInt),
                ],
              });
              await sendTransaction({
                transaction: approveHelperTx,
                account,
              });
            }
            const defaultFee = BigInt(10);
            const zeroFee = BigInt(0);
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
                  feeCreator: defaultFee,
                  feeLp: defaultFee,
                  feeMinter: zeroFee,
                  feeReferrer: defaultFee,
                  seedLiquidity: BigInt(usdValueBigInt),
                  isDppm: false,
                },
              ],
            });

            const calldata = await encode(createTx);

            const options = {
              user: account.address,
              chainId: input.fromChain,
              toChainId: input.toChain,
              currency: input.fromToken,
              toCurrency: input.toToken,
              recipient: account.address,
              referrer: "9lives.so",
              amount: usdValueBigInt, // Total value of all txs
              tradeType: "EXACT_OUTPUT" as TradeType,
              txs: [
                {
                  to: config.contracts.helperFactory.address,
                  value: usdValueBigInt, // Must match total amount
                  data: calldata,
                },
              ],
            };

            const relayClient = getClient();

            const quote = await relayClient.actions.getQuote(options);

            let targetChain = chain;

            if (input.fromChain !== chain.id) {
              targetChain = Object.values(config.chains).find(
                (c) => c.id === input.fromChain,
              )!;
              await switchChain(targetChain);
            }

            const walletClient = viemAdapter.wallet.toViem({
              client: config.thirdweb.client,
              chain: targetChain,
              wallet,
            });
            let requestId: string | undefined;
            await relayClient.actions.execute({
              quote,
              wallet: adaptViemWallet(walletClient as any),
              onProgress: ({ currentStep, currentStepItem }) => {
                if (currentStep && currentStepItem) {
                  requestId = currentStep?.requestId;
                  if (currentStepItem.error) {
                    toast.error(
                      `${currentStep.action}: ${currentStepItem.errorData?.cause?.shortMessage ?? currentStepItem.error}`,
                      { id: requestId },
                    );
                  } else if (currentStepItem.checkStatus === "success") {
                    toast.success(currentStep.description, { id: requestId });
                  } else {
                    toast.loading(
                      `${currentStep.action}: ${currentStepItem.progressState}`,
                      { id: requestId },
                    );
                  }
                }
              },
            });

            if (requestId) {
              toast.custom(
                (t) => (
                  <RelayTxToaster
                    tx={requestId!}
                    close={() => toast.dismiss(t.id)}
                  />
                ),
                {
                  duration: Infinity,
                  position: "bottom-right",
                },
              );
            }
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
            fromAmount: seedLiquidity,
            seedLiquidity: formatFusdc(usdValueBigInt, 6),
            fromChain: input.fromChain,
            fromToken: input.fromToken,
            type: "createWithRelay",
            name: input.name,
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
  return { createWithRelay };
};
export default useCreateWithRelay;
