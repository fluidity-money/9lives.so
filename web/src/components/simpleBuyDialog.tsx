import React, { useCallback, useEffect, useState } from "react";
import Button from "./themed/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formatUnits, ZeroAddress } from "ethers";
import config from "@/config";
import { useUserStore } from "@/stores/userStore";
import z from "zod";
import { combineClass } from "@/utils/combineClass";
import useTokens from "@/hooks/useTokens";
import useTokensWithBalances from "@/hooks/useTokensWithBalances";
import AssetSelector from "./assetSelector";
import useConnectWallet from "@/hooks/useConnectWallet";
import { useActiveAccount } from "thirdweb/react";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import useProfile from "@/hooks/useProfile";
import Modal from "./themed/modal";
import Funding from "./fundingBalanceDialog";
import useBuy from "@/hooks/useBuy";
import useBuyWithPaymaster from "@/hooks/useBuyWithPaymaster";
import useBuyWithRelay from "@/hooks/useBuyWithRelay";
import { SimpleCampaignDetail } from "@/types";
import ChainSelectorDropdown from "./chainSelectorDD";
import { Chain } from "thirdweb";
import useDppmWinEstimation from "@/hooks/useDppmWinEstimation";
import useFinalPrice from "@/hooks/useFinalPrice";

export default function SimpleBuyDialog({
  data,
  outcomeIdx,
  setOutcomeIdx,
  closeDialog,
}: {
  data: SimpleCampaignDetail;
  outcomeIdx: number;
  setOutcomeIdx: React.Dispatch<number>;
  closeDialog: () => void;
}) {
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const [isMinting, setIsMinting] = useState(false);
  const [isFundModalOpen, setFundModalOpen] = useState<boolean>(false);
  const { connect, isConnecting } = useConnectWallet();
  const selectedOutcome = data.outcomes[outcomeIdx];
  const enabledPaymaster = useFeatureFlag("enable paymaster dppm buy");
  const { data: profile } = useProfile();
  const account = useActiveAccount();
  const { buy } = useBuy({
    data,
    shareAddr: selectedOutcome.share.address,
    outcomeId: selectedOutcome.identifier,
    openFundModal: () => setFundModalOpen(true),
  });
  const { buy: buyWithPaymaster } = useBuyWithPaymaster({
    shareAddr: selectedOutcome.share.address,
    outcomeId: selectedOutcome.identifier,
    data,
    openFundModal: () => setFundModalOpen(true),
  });
  const { buyWithRelay } = useBuyWithRelay({
    data,
    shareAddr: selectedOutcome.share.address,
    outcomeId: selectedOutcome.identifier,
  });
  const formSchema = z
    .object({
      supply: z.string(),
      toChain: z.number().min(0),
      toToken: z.string(),
      usdValue: z.coerce.number().gt(0, "usd value > 0$"),
      fromChain: z
        .number({ message: "You need to select a chain to pay from" })
        .min(0),
      fromToken: z.string({
        message: "You need to select a token to pay with",
      }),
    })
    .superRefine((data, ctx) => {
      if (data.fromChain !== config.destinationChain.id && 2 > data.usdValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "usd value > 2$",
          path: ["usdValue"],
        });
      }
    });
  type FormData = z.infer<typeof formSchema>;
  const {
    watch,
    handleSubmit,
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supply: "",
      toChain: config.chains.superposition.id,
      toToken: ZeroAddress,
      usdValue: 0,
      fromChain: isInMiniApp
        ? config.chains.arbitrum.id
        : config.chains.superposition.id,
      fromToken: isInMiniApp
        ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base USDC
        : ZeroAddress,
    },
  });
  const supply = watch("supply");
  const fromChain = watch("fromChain");
  const fromToken = watch("fromToken");
  const { data: tokens, isSuccess: isTokensSuccess } = useTokens(fromChain);
  const { data: tokensWithBalances } = useTokensWithBalances(fromChain);
  const fromDecimals = tokens?.find((t) => t.address === fromToken)?.decimals;
  const usdValue = tokens
    ? Number(supply) *
      +(tokens.find((t) => t.address === fromToken) ?? { priceUSD: 0 }).priceUSD
    : Number(supply);
  const selectedTokenBalance = tokensWithBalances?.find(
    (t) =>
      t.token_address.toLowerCase() === fromToken.toLowerCase() ||
      (fromToken === ZeroAddress &&
        t.token_address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  )?.balance;
  const selectedTokenSymbol = tokens?.find(
    (t) =>
      t.address.toLowerCase() === fromToken.toLowerCase() ||
      (fromToken === ZeroAddress &&
        t.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  )?.symbol;
  const setToMaxShare = async () => {
    if (!selectedTokenBalance) return;
    const maxBalance = formatUnits(selectedTokenBalance, fromDecimals);
    setValue("supply", maxBalance);
    if (Number(maxBalance) > 0) clearErrors();
  };
  const {
    data: [shares, boost, refund],
  } = useDppmWinEstimation({
    tradingAddr: data.poolAddress,
    usdValue,
    outcomeId: selectedOutcome.identifier,
  });
  const handleTokenChange = useCallback(
    (addr: string) => setValue("fromToken", addr),
    [setValue],
  );
  useEffect(() => {
    if (usdValue) {
      setValue("usdValue", usdValue);
    }
  }, [usdValue, setValue]);
  const { data: currentPrice } = useFinalPrice({
    symbol: data.priceMetadata?.baseAsset,
    starting: data.starting,
    ending: data.ending,
  });
  async function handleBuy({
    supply,
    fromChain,
    fromToken,
    toChain,
    toToken,
  }: FormData) {
    try {
      setIsMinting(true);
      if (fromChain !== config.chains.superposition.id) {
        await buyWithRelay(
          account!,
          Number(supply),
          usdValue,
          fromChain,
          fromToken,
          toChain,
          toToken,
          data.outcomes,
          profile?.settings?.refererr ?? "",
          fromDecimals,
          {
            baseAsset: data.priceMetadata.baseAsset,
            priceTargetForUp: Number(data.priceMetadata.priceTargetForUp),
            priceOnBuy: currentPrice?.price,
            minuteOnBuy: Number(
              new Date().toLocaleString("en-US", {
                timeZone: "UTC",
                minute: "numeric",
              }),
            ),
          },
        );
      } else {
        let action = enabledPaymaster ? buyWithPaymaster : buy;
        await action(Number(supply), profile?.settings?.refererr ?? "", {
          baseAsset: data.priceMetadata.baseAsset,
          priceTargetForUp: Number(data.priceMetadata.priceTargetForUp),
          priceOnBuy: currentPrice?.price,
          minuteOnBuy: Number(
            new Date().toLocaleString("en-US", {
              timeZone: "UTC",
              minute: "numeric",
            }),
          ),
        });
      }
      closeDialog();
    } finally {
      setIsMinting(false);
    }
  }
  const onSubmit = () => (!account ? connect() : handleSubmit(handleBuy)());
  const handleNetworkChange = async (chain: Chain) => {
    // lifi auto switch handle this for now
    // await switchChain(chain);
    setValue("fromChain", chain.id);
  };

  return (
    <div className="flex min-h-[600px] flex-col items-center justify-between bg-9layer font-chicago">
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 flex-row space-x-1">
            <Button
              intent={outcomeIdx === 1 ? "yes" : "default"}
              title="UP ↑"
              className={"flex-1"}
              onClick={() => setOutcomeIdx(1)}
            />
            <Button
              intent={outcomeIdx === 0 ? "no" : "default"}
              title="DOWN ↓"
              className={"flex-1"}
              onClick={() => setOutcomeIdx(0)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-center font-arial text-xs text-[#808080]">
            Bridge from any chain, instantly.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-chicago text-xs">From</span>
            <ChainSelectorDropdown
              variant="small"
              handleNetworkChange={handleNetworkChange}
              selectedChainId={fromChain}
              isInMiniApp={isInMiniApp}
            />
            <span className="font-chicago text-xs">With</span>
            <AssetSelector
              tokens={tokens}
              variant="small"
              tokensWithBalances={tokensWithBalances}
              isSuccess={isTokensSuccess}
              fromToken={fromToken}
              fromChain={fromChain}
              setValue={handleTokenChange}
            />
          </div>
        </div>

        <div className="flex-1 space-y-1 text-center">
          <div className="font-geneva text-sm uppercase text-gray-500">
            Amount
          </div>
          <p
            className={combineClass(
              "w-full flex-1 border-0 bg-9layer text-center text-4xl font-bold md:hidden",
            )}
          >
            {`${supply || "0"} ${selectedTokenSymbol ?? "$"}`}
          </p>
          <div className="hidden items-center md:flex">
            <input
              {...register("supply")}
              type="number"
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              value={supply}
              placeholder="0"
              step="any"
              className={combineClass(
                "w-full flex-1 bg-9layer text-center text-right text-4xl font-bold",
                (errors.supply || errors.usdValue) && "border-2 border-red-500",
              )}
            ></input>
            <p
              className={combineClass(
                "w-full flex-1 border-0 bg-9layer text-left text-center text-4xl font-bold",
              )}
            >
              {selectedTokenSymbol ?? "$"}
            </p>
          </div>
          {selectedTokenBalance ? (
            <p className="font-arial text-xs text-[#808080]">{`(You have ${formatUnits(BigInt(selectedTokenBalance), fromDecimals)} ${selectedTokenSymbol ?? "$"})`}</p>
          ) : null}
          <div className="flex items-center justify-center gap-1">
            <div
              className={combineClass(
                usdValue && usdValue > 0 ? "visible" : "invisible",
                "text-base text-[#808080]",
              )}
            >
              <strong>${+usdValue.toFixed(3)}</strong>
            </div>
            {errors.usdValue ? (
              <span className="text-xs text-red-500">
                {errors.usdValue.message}
              </span>
            ) : null}
          </div>
        </div>

        <div className={combineClass(usdValue > 0 ? "visible" : "invisible")}>
          <div className="mx-4 flex items-center justify-between">
            <div className="text-center">
              <div className="font-geneva text-sm font-medium uppercase text-gray-500">
                If you&apos;re right
              </div>
              <div className="text-3xl font-semibold text-green-500">
                ${+(shares + boost).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="font-geneva text-sm font-medium uppercase text-gray-500">
                If you&apos;re wrong
              </div>
              <div className="text-3xl font-semibold text-green-500">
                ${+refund.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <Button
          size={"xlarge"}
          intent={"yes"}
          disabled={isMinting || isConnecting}
          title={isMinting ? "Loading.." : "BUY"}
          className={combineClass(
            Number(supply) > 0 ? "visible" : "invisible",
            "w-full uppercase",
          )}
          onClick={onSubmit}
        />

        <div className="flex text-sm">
          <Button
            title="+1"
            className={"flex-auto"}
            onClick={() => setValue("supply", (Number(supply) + 1).toString())}
          />
          <Button
            title="+10"
            className={"flex-auto"}
            onClick={() => setValue("supply", (Number(supply) + 10).toString())}
          />
          <Button
            title="+100"
            className={"flex-auto"}
            onClick={() =>
              setValue("supply", (Number(supply) + 100).toString())
            }
          />
          <Button title="MAX" className={"flex-auto"} onClick={setToMaxShare} />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-lg font-medium">
          {Array.from(Array(9), (_, i) => i + 1).map((n) => (
            <Button
              key={"btn" + n}
              title={n.toString()}
              onClick={() => setValue("supply", supply + n)}
            />
          ))}
          <Button
            title="."
            onClick={() =>
              !supply.includes(".") &&
              setValue("supply", supply ? supply + "." : "0.")
            }
          />
          <Button
            title="0"
            onClick={() => supply !== "" && setValue("supply", supply + 0)}
          />
          <Button
            title="DEL"
            onClick={() =>
              setValue("supply", supply.slice(0, supply.length - 1))
            }
          />
        </div>
      </div>
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
          fundToBuy={Number(supply)}
        />
      </Modal>
    </div>
  );
}
