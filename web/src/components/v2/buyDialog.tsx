import React, { useCallback, useEffect, useState } from "react";
import Button from "./button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import config from "@/config";
import { useUserStore } from "@/stores/userStore";
import z from "zod";
import { combineClass } from "@/utils/combineClass";
import useTokens from "@/hooks/useTokens";
import useTokensWithBalances from "@/hooks/useTokensWithBalances";
import AssetSelector from "./assetSelector";
import useConnectWallet from "@/hooks/useConnectWallet";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import useProfile from "@/hooks/useProfile";
import Modal from "./modal";
import Funding from "./fundDialog";
import useBuy from "@/hooks/useBuy";
import useBuyWithRelay from "@/hooks/useBuyWithRelay";
import { Chain, SimpleCampaignDetail } from "@/types";
import ChainSelectorDropdown from "./chainSelector";
import useDppmWinEstimation from "@/hooks/useDppmWinEstimation";
import useFinalPrice from "@/hooks/useFinalPrice";
import useAccount from "@/hooks/useAccount";
import PointsIndicator from "./pointsIndicator";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits, zeroAddress } from "viem";
import GroupButton from "./groupButton";
import Badge from "./chanceBadge";

export default function SimpleBuyDialog({
  data,
  outcomeIdx,
  setOutcomeIdx,
  closeDialog,
  chance,
}: {
  data: SimpleCampaignDetail;
  outcomeIdx: number;
  setOutcomeIdx: React.Dispatch<number>;
  closeDialog: () => void;
  chance: string;
}) {
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const [isMinting, setIsMinting] = useState(false);
  const [isFundModalOpen, setFundModalOpen] = useState<boolean>(false);
  const { connect, isConnecting } = useConnectWallet();
  const selectedOutcome = data.outcomes[outcomeIdx];
  const enabledASBuy = useFeatureFlag("enable account system buy");
  const { data: profile } = useProfile();
  const account = useAppKitAccount();
  const { buy } = useBuy({
    data,
    shareAddr: selectedOutcome.share.address,
    outcomeId: selectedOutcome.identifier,
    openFundModal: () => setFundModalOpen(true),
  });
  const { buy: buyWithAS } = useAccount({
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
  const enableExactInputBuyWithRelay = useFeatureFlag(
    "enable exact input style buy with relay",
  );
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
      if (
        !enableExactInputBuyWithRelay &&
        data.fromChain !== config.destinationChain.id &&
        2 > data.usdValue
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "usd value > 2$",
          path: ["usdValue"],
        });
      } else if (
        data.fromChain === config.destinationChain.id &&
        1 > Number(supply)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "usd value >= 1$",
          path: ["usdValue"],
        });
      }
    });
  type FormData = z.infer<typeof formSchema>;
  const {
    watch,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supply: "",
      toChain: config.chains.superposition.id,
      toToken: zeroAddress,
      usdValue: 0,
      fromChain: isInMiniApp
        ? config.chains.base.id
        : config.chains.superposition.id,
      fromToken: isInMiniApp
        ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base USDC
        : zeroAddress,
    },
  });
  const supply = watch("supply");
  const fromChain = watch("fromChain");
  const fromToken = watch("fromToken");
  const { data: tokens, isSuccess: isTokensSuccess } = useTokens(fromChain);
  const { data: tokensWithBalances } = useTokensWithBalances(fromChain, tokens);
  const fromDecimals = tokens?.find((t) => t.address === fromToken)?.decimals;
  const usdValue = tokens
    ? Number(supply) *
      +(tokens.find((t) => t.address === fromToken) ?? { priceUSD: 0 }).priceUSD
    : Number(supply);
  const selectedTokenBalance = tokensWithBalances?.find(
    (t) =>
      t.address.toLowerCase() === fromToken.toLowerCase() ||
      (fromToken === zeroAddress &&
        t.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  )?.balance;
  const selectedTokenSymbol = tokens?.find(
    (t) =>
      t.address.toLowerCase() === fromToken.toLowerCase() ||
      (fromToken === zeroAddress &&
        t.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  )?.symbol;
  const setToShare = async (percentage: number) => {
    if (!selectedTokenBalance || !fromDecimals) return;
    const maxBalance = formatUnits(selectedTokenBalance, fromDecimals);
    setValue("supply", ((Number(maxBalance) * percentage) / 1).toString());
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
        if (!account.address) return connect();
        await buyWithRelay(
          account.address,
          Number(supply),
          usdValue,
          fromChain,
          fromToken,
          toChain,
          toToken,
          data.outcomes,
          profile?.settings?.refererr ?? zeroAddress,
          fromDecimals,
          {
            baseAsset: data.priceMetadata.baseAsset,
            priceTargetForUp: Number(data.priceMetadata.priceTargetForUp),
            priceOnBuy: currentPrice?.price,
            volumeOnBuy: data.totalVolume,
            minuteOnBuy: Number(
              new Date().toLocaleString("en-US", {
                timeZone: "UTC",
                minute: "numeric",
              }),
            ),
          },
        );
      } else {
        const action = enabledASBuy ? buyWithAS : buy;
        await action(
          Number(supply),
          profile?.settings?.refererr ?? zeroAddress,
          {
            baseAsset: data.priceMetadata.baseAsset,
            priceTargetForUp: Number(data.priceMetadata.priceTargetForUp),
            priceOnBuy: currentPrice?.price,
            volumeOnBuy: data.totalVolume,
            minuteOnBuy: Number(
              new Date().toLocaleString("en-US", {
                timeZone: "UTC",
                minute: "numeric",
              }),
            ),
          },
        );
      }
      closeDialog();
    } finally {
      setIsMinting(false);
    }
  }
  const onSubmit = () =>
    !account.isConnected ? connect() : handleSubmit(handleBuy)();
  const { chainId } = useAppKitNetwork();
  const handleNetworkChange = useCallback(
    async (chain: Chain) => {
      // lifi auto switch handle this for now
      // await switchChain(chain);
      setValue("fromChain", chain.id);
    },
    [setValue],
  );
  useEffect(() => {
    if (chainId) {
      const selectedChain = Object.values(config.chains).find(
        (c) => c.id === chainId,
      );
      if (selectedChain) {
        handleNetworkChange(selectedChain);
      }
    }
  }, [chainId, handleNetworkChange]);

  const handleSupplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;

    v = v.replace(",", ".");

    v = v.replace(/[^0-9.]/g, "");

    const parts = v.split(".");
    if (parts.length > 2) {
      v = parts[0] + "." + parts.slice(1).join("");
    }

    setValue("supply", v, { shouldDirty: true });
  };
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-between">
      <div className="flex min-h-[600px] w-full flex-col justify-between space-y-4">
        <GroupButton
          initialIdx={outcomeIdx === 0 ? 1 : 0}
          buttons={[
            {
              title: "Buy Yes",
              callback: () => setOutcomeIdx(1),
              textColor: "text-green-700",
            },
            {
              title: "Buy No",
              callback: () => setOutcomeIdx(0),
              textColor: "text-red-700",
            },
          ]}
        />
        <div className="flex items-center justify-between gap-2">
          <AssetSelector
            tokens={tokens}
            variant="small"
            tokensWithBalances={tokensWithBalances}
            isSuccess={isTokensSuccess}
            fromToken={fromToken}
            fromChain={fromChain}
            setValue={handleTokenChange}
          />
          <ChainSelectorDropdown
            variant="small"
            handleNetworkChange={handleNetworkChange}
            selectedChainId={fromChain}
            isInMiniApp={isInMiniApp}
          />
        </div>

        <div className="flex flex-1 flex-col justify-center space-y-1 text-center">
          <p
            className={combineClass(
              "w-full flex-1 border-0 bg-2white text-center text-4xl font-bold md:hidden",
            )}
          >
            {supply || "0"}{" "}
            <span className="text-lg font-[500] text-neutral-400">
              {selectedTokenSymbol ?? "$"}
            </span>
          </p>
          <div className="hidden items-center md:flex">
            <input
              type="text"
              inputMode="decimal"
              autoFocus={true}
              value={supply}
              onChange={handleSupplyChange}
              placeholder="0"
              className={combineClass(
                "mr-2 hidden w-full flex-1 bg-2white text-right text-4xl font-bold outline-none md:block",
                (errors.supply || errors.usdValue) && "border-2 border-red-500",
              )}
            />
            <p
              className={combineClass(
                "w-full flex-1 border-0 bg-2white text-left text-lg font-[500] text-neutral-400",
              )}
            >
              {selectedTokenSymbol ?? "$"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1">
            <div
              className={combineClass(
                usdValue && usdValue > 0 ? "visible" : "invisible",
                "text-xs text-neutral-400",
              )}
            >
              = ${+usdValue.toFixed(3)}
            </div>
            {errors.usdValue ? (
              <span className="text-xs text-red-500">
                {errors.usdValue.message}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <svg
              width="11"
              height="10"
              viewBox="0 0 11 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.73082 3.91304C9.73082 3.79776 9.68618 3.68717 9.60688 3.60564C9.52757 3.52413 9.41992 3.47829 9.30776 3.47826H1.71788C1.56412 3.47826 1.41373 3.45652 1.26962 3.41669V8.26087L1.27168 8.30375C1.28129 8.40331 1.32412 8.49691 1.39356 8.56827C1.4729 8.64977 1.5805 8.69565 1.69268 8.69565H9.30776C9.41992 8.69562 9.52757 8.64978 9.60688 8.56827C9.68618 8.48674 9.73082 8.37615 9.73082 8.26087V3.91304ZM11 8.26087C11 8.72209 10.8215 9.16434 10.5042 9.49049C10.1869 9.81661 9.75653 9.99997 9.30776 10H1.69268C1.24387 10 0.813155 9.81664 0.495799 9.49049C0.178533 9.16435 0.000438463 8.72204 0.000438463 8.26087V1.77862C-0.0045487 1.553 0.0330397 1.32844 0.111574 1.11753C0.192885 0.8992 0.31597 0.699833 0.473902 0.53159C0.631876 0.363313 0.821376 0.229335 1.03082 0.137993C1.24015 0.046716 1.46529 0.000310465 1.69268 0.000424592L8.67317 0C9.02359 6.76654e-05 9.30776 0.29203 9.30776 0.652174C9.30776 1.01232 9.02359 1.30428 8.67317 1.30435H1.69227C1.63541 1.30431 1.57894 1.31592 1.52659 1.33874C1.47423 1.36158 1.42686 1.39518 1.38736 1.43725C1.34789 1.4793 1.31721 1.52916 1.29689 1.58373C1.27657 1.63828 1.26715 1.69647 1.26921 1.75484L1.27251 1.7956C1.3007 1.9978 1.48166 2.17388 1.71788 2.17391H9.30776C9.75653 2.17395 10.1869 2.3573 10.5042 2.68342C10.8215 3.00957 11 3.45183 11 3.91304V8.26087Z"
                fill="#A3A3A3"
              />
            </svg>
            <p className="font-arial text-xs text-[#808080]">
              {selectedTokenBalance && fromDecimals
                ? formatUnits(BigInt(selectedTokenBalance), fromDecimals)
                : "0"}{" "}
              {selectedTokenSymbol ?? "$"}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              size={"small"}
              title={"10%"}
              className={"flex-auto"}
              onClick={() => setToShare(0.1)}
            />
            <Button
              size={"small"}
              title={"25%"}
              className={"flex-auto"}
              onClick={() => setToShare(0.25)}
            />
            <Button
              title={"50%"}
              size={"small"}
              className={"flex-auto"}
              onClick={() => setToShare(0.5)}
            />
            <Button
              disabled={!account}
              title="MAX"
              size={"small"}
              className={"flex-auto"}
              onClick={() => setToShare(1)}
            />
          </div>
        </div>

        <div className={combineClass(usdValue > 0 ? "visible" : "invisible")}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-bold text-neutral-400">
                If Correct Win:
              </div>
              <div className="text-xl font-bold text-green-600">
                <span className="text-neutral-400">+</span> $
                {+(shares + boost).toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col justify-end gap-1">
              <div className="text-xs font-bold text-neutral-400">
                If Incorrect Win:
              </div>
              <div className="text-xl font-bold text-green-600">
                <span className="text-neutral-400">+</span> $
                {+refund.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <PointsIndicator
          starting={data.starting}
          ending={data.ending}
          usdValue={usdValue}
        />

        <div className="grid grid-cols-3 gap-3 text-center text-lg font-medium md:hidden">
          {Array.from(Array(9), (_, i) => i + 1).map((n) => (
            <Button
              intent={"inverted"}
              key={"btn" + n}
              title={n.toString()}
              onClick={() => setValue("supply", supply + n)}
            />
          ))}
          <Button
            title="."
            intent={"inverted"}
            onClick={() =>
              !supply.includes(".") &&
              setValue("supply", supply ? supply + "." : "0.")
            }
          />
          <Button
            intent={"inverted"}
            title="0"
            onClick={() => supply !== "" && setValue("supply", supply + 0)}
          />
          <Button
            title="DEL"
            intent={"inverted"}
            className={"font-bold"}
            onClick={() =>
              setValue("supply", supply.slice(0, supply.length - 1))
            }
          />
        </div>

        <div className="flex items-center justify-start gap-1">
          <Button intent={"inverted"} size={"large"} onClick={closeDialog}>
            <svg
              width="16"
              height="24"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.13389 -0.0874324C7.64457 -0.595061 8.48294 -0.604669 9.00648 -0.109503C9.52998 0.385689 9.54092 1.19864 9.03027 1.70632L3.99085 6.71637H15.1508C15.8822 6.71637 16.4751 7.29129 16.4751 8.00048C16.4751 8.70968 15.8822 9.2846 15.1508 9.2846H3.99085L9.03027 14.2947C9.54092 14.8023 9.52998 15.6153 9.00648 16.1105C8.48294 16.6056 7.64457 16.596 7.13389 16.0884L-0.0988334 8.89736C-0.600519 8.39859 -0.600519 7.60237 -0.0988334 7.10361L7.13389 -0.0874324Z"
                fill="#181818"
              />
            </svg>
          </Button>
          <Button
            size={"large"}
            disabled={isMinting || isConnecting || !(Number(supply) > 0)}
            title={isMinting ? "Loading.." : "Confirm"}
            className={combineClass(
              outcomeIdx === 1 ? "text-green-300" : "text-red-300",
              "w-full",
            )}
            onClick={onSubmit}
            badge={
              <Badge
                intent={outcomeIdx === 1 ? "invertedYes" : "invertedNo"}
                chance={chance}
              />
            }
          />
        </div>
      </div>
      <Modal
        isOpen={isFundModalOpen}
        setIsOpen={setFundModalOpen}
        boxContainerClass="max-w-[600]"
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
