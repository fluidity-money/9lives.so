import Button from "@/components/themed/button";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import Input from "../themed/input";
import { CampaignDetail, SelectedOutcome } from "@/types";
import useBuy from "@/hooks/useBuy";
import { useActiveAccount } from "thirdweb/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import useConnectWallet from "@/hooks/useConnectWallet";
import { Chain, prepareContractCall, simulateTransaction } from "thirdweb";
import config from "@/config";
import { formatUnits, ZeroAddress } from "ethers";
import ShadowCard from "../cardShadow";
import ErrorInfo from "../themed/errorInfo";
import usePotentialReturn from "@/hooks/usePotentialReturn";
import YesOutcomeImg from "#/images/yes-outcome.svg";
import NoOutcomeImg from "#/images/no-outcome.svg";
import AssetSelector from "../assetSelector";
import Modal from "../themed/modal";
import Funding from "../fundingBalanceDialog";
import DownIcon from "#/icons/down-caret.svg";
import useReturnValue from "@/hooks/useReturnValue";
import useDpmChances from "@/hooks/useDpmChances";
import formatFusdc from "@/utils/formatFusdc";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import useBuyWithZaps from "@/hooks/useBuyWithZaps";
import USDCImg from "#/images/usdc.svg";
import useTokens from "@/hooks/useTokens";
import useProfile from "@/hooks/useProfile";
import useBuyWithPaymaster from "@/hooks/useBuyWithPaymaster";
import { useUserStore } from "@/stores/userStore";

export default function DetailBuyAction({
  shouldStopAction,
  data,
  selectedOutcome,
  price,
  isDpm,
  minimized,
  setMinimized,
}: {
  shouldStopAction: boolean;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  data: CampaignDetail;
  price: string;
  isDpm?: boolean;
  minimized: boolean;
  setMinimized: React.Dispatch<boolean>;
}) {
  const enabledLifiZaps =
    useFeatureFlag("enable lifi zaps") &&
    config.NEXT_PUBLIC_CHAIN !== "testnet";
  const enabledPaymaster = useFeatureFlag("enable paymaster");
  const [isFundModalOpen, setFundModalOpen] = useState<boolean>(false);
  const { connect, isConnecting } = useConnectWallet();
  const account = useActiveAccount();
  const { data: profile } = useProfile();
  const outcome = selectedOutcome
    ? data.outcomes.find((o) => o.identifier === selectedOutcome.id)!
    : data.outcomes[0];
  const ctaTitle = selectedOutcome?.state === "sell" ? "Sell" : "Buy";
  const [isMinting, setIsMinting] = useState(false);
  const formSchema = z.object({
    supply: z.coerce
      .number()
      .gte(0.1, { message: "Invalid usdc to spend, min 0.1$ necessary" }),
  });
  const formSchemaWithZap = z.object({
    supply: z.coerce.number().gt(0, { message: "Invalid amount to spend" }),
    toChain: z.number().min(0),
    toToken: z.string(),
    fromChain: z
      .number({ message: "You need to select a chain to pay from" })
      .min(0),
    fromToken: z.string({ message: "You need to select a token to pay with" }),
  });
  const chanceAmm = Number(price) * 100;
  const dpmChance = useDpmChances({
    investmentAmounts: data.investmentAmounts,
    totalVolume: data.totalVolume,
    outcomeIds: [selectedOutcome.id as `0x${string}`],
  })?.[0]?.chance;
  const chance = isDpm ? dpmChance : chanceAmm;
  type FormData = z.infer<typeof formSchemaWithZap>;
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    disabled: shouldStopAction,
    resolver: zodResolver(enabledLifiZaps ? formSchemaWithZap : formSchema),
    defaultValues: {
      supply: 0,
      toChain: config.chains.superposition.id,
      toToken: config.NEXT_PUBLIC_FUSDC_ADDR,
      fromChain: config.chains.superposition.id,
      fromToken: config.NEXT_PUBLIC_FUSDC_ADDR,
    },
  });
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const supply = watch("supply");
  const fromChain = watch("fromChain");
  const fromToken = watch("fromToken");
  const { data: tokens, isSuccess: isTokensSuccess } = useTokens(fromChain);
  const { buy } = useBuy({
    tradingAddr: data.poolAddress,
    shareAddr: outcome.share.address,
    campaignId: data.identifier,
    outcomes: data.outcomes,
    outcomeId: outcome.identifier,
    openFundModal: () => setFundModalOpen(true),
  });
  const { buy: buyWithPaymaster } = useBuyWithPaymaster({
    tradingAddr: data.poolAddress,
    shareAddr: outcome.share.address,
    outcomeId: outcome.identifier,
    data,
    outcomes: data.outcomes,
    openFundModal: () => setFundModalOpen(true),
  });
  const { buyWithZaps } = useBuyWithZaps({
    tradingAddr: data.poolAddress,
    shareAddr: outcome.share.address,
    campaignId: data.identifier,
    outcomeId: outcome.identifier,
  });
  const usdValue = tokens
    ? supply *
      +(tokens.find((t) => t.address === fromToken) ?? { priceUSD: 0 }).priceUSD
    : supply;
  const fromDecimals = tokens?.find((t) => t.address === fromToken)?.decimals;
  const { data: estimatedSharesToGet } = useReturnValue({
    outcomeId: outcome.identifier,
    shareAddr: outcome.share.address,
    tradingAddr: data.poolAddress,
    fusdc: usdValue,
  });
  const sharesToGet = formatFusdc(estimatedSharesToGet ?? 0, 2);
  const estimatedWinForDpm = usePotentialReturn({
    investmentAmounts: data.investmentAmounts,
    outcomeId: outcome.identifier,
    fusdc: usdValue,
    share: supply / Number(price),
  });
  const orderSummary = [
    {
      title: "AVG Price",
      value: `$${isDpm ? price : (isNaN(usdValue / +sharesToGet) ? 0 : usdValue / +sharesToGet).toFixed(2)}`,
    },
    {
      title: "Shares To Get",
      value: isDpm ? (usdValue / Number(price)).toFixed(2) : sharesToGet,
    },
    {
      title: "To Win 💵",
      value: `$${isDpm ? estimatedWinForDpm.toFixed(2) : sharesToGet}`,
    },
  ];
  async function handleBuy({
    supply,
    fromChain,
    fromToken,
    toChain,
    toToken,
  }: FormData) {
    try {
      setIsMinting(true);
      if (enabledLifiZaps && fromChain !== config.chains.superposition.id) {
        await buyWithZaps(
          account!,
          supply,
          usdValue,
          fromChain,
          fromToken,
          toChain,
          toToken,
          data.outcomes,
          profile?.settings?.refererr ?? "",
          fromDecimals,
        );
      } else {
        let action = enabledPaymaster ? buyWithPaymaster : buy;
        await action(supply);
      }
    } finally {
      setIsMinting(false);
    }
  }
  function handleFocus() {
    if (!account) connect();
  }
  const setToMaxShare = async () => {
    const balance = (await simulateTransaction({
      transaction: prepareContractCall({
        contract: config.contracts.fusdc,
        method: "balanceOf",
        params: [account!.address],
      }),
    })) as bigint;
    const maxfUSDC = +formatUnits(balance, config.contracts.decimals.fusdc);
    setValue("supply", maxfUSDC);
    if (maxfUSDC > 0) clearErrors();
  };
  const onSubmit = () => (!account ? connect() : handleSubmit(handleBuy)());
  useEffect(() => {
    const floatingBtn = document.getElementById("degen-floating-button");
    if (floatingBtn) {
      floatingBtn.style.marginBottom = "150px";
      return () => {
        floatingBtn.style.marginBottom = "0px";
      };
    }
  }, []);
  const handleNetworkChange = async (chain: Chain) => {
    // lifi auto switch handle this for now
    // await switchChain(chain);
    setValue("fromChain", chain.id);
  };
  const handleTokenChange = useCallback(
    (addr: string) => setValue("fromToken", addr),
    [setValue],
  );
  return (
    <>
      <ShadowCard
        className={combineClass(
          minimized ? "flex-row" : "flex-col",
          "fixed inset-x-0 bottom-0 z-10 flex gap-4 p-4 md:sticky md:top-0 md:flex-col",
        )}
      >
        <div
          className="absolute right-4 top-[-41px] rounded-t-sm border border-b-0 border-9black bg-9layer p-2 md:hidden"
          onClick={() => setMinimized(!minimized)}
        >
          <Image
            src={DownIcon}
            alt=""
            className={combineClass(minimized && "rotate-180")}
          />
        </div>
        <div
          className={combineClass(
            "flex items-center gap-4",
            minimized && "flex-col md:flex-row",
          )}
        >
          {outcome.picture || (!outcome.picture && data.isYesNo) ? (
            <div
              className={combineClass(
                !data.isYesNo && "size-10 overflow-hidden rounded-full",
              )}
            >
              <Image
                width={40}
                height={40}
                alt={outcome.name}
                src={
                  data.isYesNo
                    ? outcome.name === "Yes"
                      ? YesOutcomeImg
                      : NoOutcomeImg
                    : outcome.picture
                }
                className="size-full object-cover"
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-1">
            <h3
              className={combineClass(
                minimized ? "text-xs" : "text-md",
                "font-chicago font-normal text-9black md:text-lg",
              )}
            >
              {outcome.name}
            </h3>
            <div
              className={combineClass(
                minimized ? "text-[10px]" : "text-sm",
                "flex items-center gap-1 font-geneva uppercase",
              )}
            >
              <span>Chance</span>
              <span className="bg-9green px-1 py-0.5">
                {chance?.toFixed(0) ?? "?"}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            {enabledLifiZaps ? (
              <div
                className={combineClass(
                  minimized ? "hidden" : "flex",
                  "items-center justify-between md:flex",
                )}
              >
                <span className="font-chicago text-xs font-normal text-9black">
                  Supply
                </span>
                <span className="text-xs font-normal text-9black">
                  USD Value: ${usdValue.toFixed(2)}
                </span>
              </div>
            ) : (
              <div
                className={combineClass(
                  minimized ? "hidden" : "flex",
                  "items-center justify-between md:flex",
                )}
              >
                <span className="font-chicago text-xs font-normal text-9black">
                  Asset to spend
                </span>
                <Button
                  disabled={shouldStopAction || !account}
                  onClick={setToMaxShare}
                  intent={"default"}
                  size={"small"}
                  title="Max"
                />
              </div>
            )}
            <div className="flex gap-2.5">
              {enabledLifiZaps ? (
                <AssetSelector
                  tokens={tokens}
                  isSuccess={isTokensSuccess}
                  fromToken={fromToken}
                  fromChain={fromChain}
                  setValue={handleTokenChange}
                />
              ) : (
                <div
                  className={combineClass(
                    "relative flex items-center gap-1 rounded-[3px] border border-9black py-2 pl-2.5 pr-8 shadow-9btnSecondaryIdle",
                    "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                  )}
                >
                  <Image src={USDCImg} alt="fusdc" width={20} />
                  <span className="font-chicago">{"USDC"}</span>
                </div>
              )}
              <Input
                {...register("supply")}
                type="number"
                min={0}
                max={Number.MAX_SAFE_INTEGER}
                value={supply}
                placeholder="0"
                step="any"
                onFocus={handleFocus}
                className={combineClass(
                  "w-full flex-1 text-center",
                  errors.supply && "border-2 border-red-500",
                )}
              />
            </div>
            {errors.supply && <ErrorInfo text={errors.supply.message} />}
            {enabledLifiZaps ? (
              <div className="flex flex-col gap-1.5">
                <span className="font-chicago text-xs font-normal text-9black">
                  From{" "}
                  <span className="underline">
                    {
                      Object.values(
                        isInMiniApp
                          ? {
                              superposition: config.chains.superposition,
                              ...config.farcasterChains,
                            }
                          : config.chains,
                      ).find((chain) => chain.id === fromChain)?.name
                    }
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  {Object.values(
                    isInMiniApp
                      ? {
                          superposition: config.chains.superposition,
                          ...config.farcasterChains,
                        }
                      : config.chains,
                  ).map((chain) => (
                    <div
                      key={chain.id}
                      onClick={() => handleNetworkChange(chain)}
                      title={chain.name}
                      className="cursor-pointer"
                    >
                      <Image
                        alt={chain.name ?? ""}
                        src={chain.icon}
                        className={combineClass(
                          chain.id === fromChain
                            ? "border-2 border-9black"
                            : "border border-9black/50 grayscale",
                          "size-8",
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {errors.fromChain && <ErrorInfo text={errors.fromChain.message} />}
            {errors.fromToken && <ErrorInfo text={errors.fromToken.message} />}
          </div>
          <div
            className={combineClass(
              minimized && "hidden",
              "flex-col gap-4 bg-9gray p-5 text-xs shadow-9orderSummary md:flex",
            )}
          >
            <span className="font-chicago uppercase">Order Summary</span>
            <ul className="flex flex-col gap-1 text-gray-500">
              {orderSummary.map((item) => (
                <li
                  className="flex items-center justify-between"
                  key={item.title}
                >
                  <strong>{item.title}</strong>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button
            disabled={isMinting || isConnecting || shouldStopAction}
            title={isMinting ? "Loading.." : ctaTitle}
            className={"uppercase"}
            size={"xlarge"}
            intent={"yes"}
            onClick={onSubmit}
          />
        </div>
      </ShadowCard>
      <Modal
        isOpen={isFundModalOpen}
        setIsOpen={setFundModalOpen}
        title="MINT FUNDING"
      >
        <Funding
          type="buy"
          closeModal={() => setFundModalOpen(false)}
          campaignId={data.identifier}
          title={data.name}
          fundToBuy={supply}
        />
      </Modal>
    </>
  );
}
