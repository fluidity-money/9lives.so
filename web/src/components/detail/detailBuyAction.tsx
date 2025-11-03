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
import formatFusdc from "@/utils/format/formatUsdc";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import USDCImg from "#/images/usdc.svg";
import useTokens from "@/hooks/useTokens";
import useProfile from "@/hooks/useProfile";
import useBuyWithPaymaster from "@/hooks/useBuyWithPaymaster";
import { useUserStore } from "@/stores/userStore";
import useBuyWithRelay from "@/hooks/useBuyWithRelay";
import useTokensWithBalances from "@/hooks/useTokensWithBalances";
import ChainSelector from "../chainSelector";
import useDppmWinEstimation from "@/hooks/useDppmWinEstimation";

export default function DetailBuyAction({
  shouldStopAction,
  data,
  selectedOutcome,
  price,
  minimized,
  setMinimized,
}: {
  shouldStopAction: boolean;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  data: CampaignDetail;
  price: string;
  minimized: boolean;
  setMinimized: React.Dispatch<boolean>;
}) {
  const enabledRelay =
    useFeatureFlag("enable relay buy") &&
    config.NEXT_PUBLIC_CHAIN !== "testnet";
  const enabledPaymaster = useFeatureFlag("enable paymaster buy");
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
  const formSchemaWithRelay = z
    .object({
      supply: z.coerce.number().gt(0, { message: "Invalid amount to spend" }),
      toChain: z.number().min(0),
      toToken: z.string(),
      usdValue: z.coerce.number().gt(0, "Usd value need to higher than 0"),
      fromChain: z
        .number({ message: "You need to select a chain to pay from" })
        .min(0),
      fromToken: z.string({
        message: "You need to select a token to pay with",
      }),
    })
    .superRefine((data, ctx) => {
      if (data.fromChain !== config.destinationChain.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Investment must be at least 2$",
          path: ["usdValue"],
        });
      }
    });
  const chanceAmm = Number(price) * 100;
  const dpmChance = useDpmChances({
    investmentAmounts: data.investmentAmounts,
    totalVolume: data.totalVolume,
    outcomeIds: [selectedOutcome.id as `0x${string}`],
  })?.[0]?.chance;
  const chance = data.isDpm ? dpmChance : chanceAmm;
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  type FormData = z.infer<typeof formSchemaWithRelay>;
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    disabled: shouldStopAction,
    resolver: zodResolver(enabledRelay ? formSchemaWithRelay : formSchema),
    defaultValues: {
      supply: 0,
      toChain: config.chains.superposition.id,
      toToken: ZeroAddress,
      usdValue: 0,
      fromChain: isInMiniApp
        ? config.chains.arbitrum.id
        : config.chains.superposition.id,
      fromToken: ZeroAddress,
    },
  });
  const supply = watch("supply");
  const fromChain = watch("fromChain");
  const fromToken = watch("fromToken");
  const { data: tokens, isSuccess: isTokensSuccess } = useTokens(fromChain);
  const { data: tokensWithBalances } = useTokensWithBalances(fromChain);
  const selectedTokenBalance = tokensWithBalances?.find(
    (t) =>
      t.token_address.toLowerCase() === fromToken.toLowerCase() ||
      (fromToken === ZeroAddress &&
        t.token_address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  )?.balance;
  const { buy } = useBuy({
    tradingAddr: data.poolAddress,
    shareAddr: outcome.share.address,
    campaignId: data.identifier,
    outcomes: data.outcomes,
    outcomeId: outcome.identifier,
    openFundModal: () => setFundModalOpen(true),
  });
  const { buy: buyWithPaymaster } = useBuyWithPaymaster({
    shareAddr: outcome.share.address,
    outcomeId: outcome.identifier,
    data,
    openFundModal: () => setFundModalOpen(true),
  });
  const { buyWithRelay } = useBuyWithRelay({
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
  const [shares, boost, refund] = useDppmWinEstimation({
    outcomeId: selectedOutcome.id as `0x${string}`,
    usdValue,
    tradingAddr: data.poolAddress,
    enabled: data.isDppm,
  });
  const winEstimation = data.isDpm
    ? estimatedWinForDpm
    : data.isDppm
      ? shares
      : Number(sharesToGet);
  const orderSummary = [
    {
      title: "AVG Price",
      value: `$${data.isDpm ? price : (isNaN(usdValue / +sharesToGet) ? 0 : usdValue / +sharesToGet).toFixed(2)}`,
    },
    {
      title: "Shares To Get",
      value: data.isDpm
        ? (usdValue / Number(price)).toFixed(2)
        : `$${usdValue > 0 ? sharesToGet : 0}`,
    },
    {
      title: "Boost To Get",
      value: `$${usdValue > 0 ? boost : 0}`,
      show: data.isDppm,
    },
    {
      title: "Refund To Get",
      value: `$${usdValue > 0 ? refund : 0}`,
      show: data.isDppm,
    },
  ];
  const winSummary = [
    {
      title: "Profit",
      value: Number(winEstimation) - usdValue,
      symbol: "$",
    },
    {
      title: "Change",
      value: ((Number(winEstimation) - usdValue) / usdValue) * 100,
      symbol: "%",
    },
    {
      title: "Multiplier",
      value: Number(winEstimation) / usdValue,
      symbol: "x",
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
      if (enabledRelay && fromChain !== config.chains.superposition.id) {
        await buyWithRelay(
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
        await action(supply, profile?.settings?.refererr ?? "");
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
  const setToMaxShare2 = async () => {
    if (!selectedTokenBalance) return;
    const maxBalance = +formatUnits(selectedTokenBalance, fromDecimals);
    setValue("supply", maxBalance);
    if (maxBalance > 0) clearErrors();
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
  useEffect(() => {
    if (usdValue) {
      setValue("usdValue", usdValue);
    }
  }, [usdValue, setValue]);
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
          {outcome.picture ||
          (!outcome.picture && (data.isYesNo || data.isDppm)) ? (
            <div
              className={combineClass(
                !(data.isYesNo || data.isDppm) &&
                  "size-10 overflow-hidden rounded-full",
              )}
            >
              <Image
                width={40}
                height={40}
                alt={outcome.name}
                src={
                  data.isYesNo || data.isDppm
                    ? outcome.name === "Yes" || outcome.name === "Up"
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
            <span className="font-chicago text-xs font-normal text-9black">
              Supply
            </span>
            {enabledRelay ? (
              <div
                className={combineClass(
                  minimized ? "hidden" : "flex",
                  "items-center justify-between md:flex",
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-normal text-9black/50">
                    {selectedTokenBalance
                      ? formatUnits(selectedTokenBalance, fromDecimals)
                      : 0}
                  </span>
                  <Button
                    disabled={
                      shouldStopAction || !account || !selectedTokenBalance
                    }
                    onClick={setToMaxShare2}
                    intent={"default"}
                    size={"small"}
                    title="Max"
                  />
                </div>
                <span className="text-xs font-normal text-9black/50">
                  ${usdValue.toFixed(2)}
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
              {enabledRelay ? (
                <AssetSelector
                  tokens={tokens}
                  tokensWithBalances={tokensWithBalances}
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
                  (errors.supply || errors.usdValue) &&
                    "border-2 border-red-500",
                )}
              />
            </div>
            {errors.supply && <ErrorInfo text={errors.supply.message} />}
            {errors.usdValue && <ErrorInfo text={errors.usdValue.message} />}
            {enabledRelay ? (
              <ChainSelector
                handleNetworkChange={handleNetworkChange}
                selectedChainId={fromChain}
                isInMiniApp={isInMiniApp}
              />
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
              {orderSummary
                .filter((i) => !(i.show === false))
                .map((item) => (
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
          {Number(supply) ? (
            <div
              className={combineClass(
                minimized && "hidden",
                "flex-col gap-4 bg-9gray p-5 text-xs shadow-9orderSummary md:flex",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-chicago uppercase">To Win 💵</span>
                <span className="bg-9green px-1 py-0.5 font-chicago text-lg">
                  $
                  {Number(
                    data.isDppm
                      ? winEstimation + boost + refund
                      : winEstimation,
                  ).toFixed(2)}
                </span>
              </div>
              <ul className="flex flex-col gap-1 text-gray-500">
                {winSummary.map((i) => (
                  <li
                    key={"winSum_" + i.title}
                    className="flex items-center justify-between"
                  >
                    <strong>{i.title}</strong>
                    <span
                      className={combineClass(
                        0 > i.value ? "bg-9red" : "bg-9green",
                        "px-1 py-0.5 font-geneva",
                      )}
                    >
                      {i.symbol}
                      {i.value.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
