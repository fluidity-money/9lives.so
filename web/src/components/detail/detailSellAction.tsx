import Button from "@/components/themed/button";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import Input from "../themed/input";
import { CampaignDetail, SelectedOutcome } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import useConnectWallet from "@/hooks/useConnectWallet";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
  toUnits,
} from "thirdweb";
import config from "@/config";
import { formatUnits } from "ethers";
import ShadowCard from "../cardShadow";
import ErrorInfo from "../themed/errorInfo";
import YesOutcomeImg from "#/images/yes-outcome.svg";
import NoOutcomeImg from "#/images/no-outcome.svg";
import DownIcon from "#/icons/down-caret.svg";
import useSell from "@/hooks/useSell";
import ERC20Abi from "@/config/abi/erc20";
import thirdweb from "@/config/thirdweb";
import usePositions from "@/hooks/usePositions";
import useEstimateBurn from "@/hooks/useEstimateBurn";
import formatFusdc from "@/utils/format/formatUsdc";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import useSellWithPaymaster from "@/hooks/useSellWithPaymaster";

export default function DetailSellAction({
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
  const enabledPaymaster = useFeatureFlag("enable paymaster sell");
  const { connect, isConnecting } = useConnectWallet();
  const account = useActiveAccount();
  const outcome = selectedOutcome
    ? data.outcomes.find((o) => o.identifier === selectedOutcome.id)!
    : data.outcomes[0];
  const [isSelling, setIsSelling] = useState(false);
  const formSchema = z.object({
    shareToBurn: z.preprocess((val) => Number(val), z.number().gt(0)),
    minUsdcToGet: z.preprocess((val) => Number(val), z.number().min(0)),
  });
  const chance = Number(price) * 100;
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    disabled: shouldStopAction,
    resolver: zodResolver(formSchema),
    defaultValues: {
      shareToBurn: 0,
      minUsdcToGet: 0,
    },
  });
  const { sell } = useSell({
    tradingAddr: data.poolAddress,
    shareAddr: outcome.share.address,
    campaignId: data.identifier,
    outcomeId: outcome.identifier,
    outcomes: data.outcomes,
  });
  const { sell: sellWithPaymaster } = useSellWithPaymaster({
    tradingAddr: data.poolAddress,
    shareAddr: outcome.share.address,
    data,
    outcomeId: outcome.identifier,
    outcomes: data.outcomes,
  });
  const share = watch("shareToBurn");
  const { data: ownedShares } = usePositions({
    tradingAddr: data.poolAddress,
    outcomes: data.outcomes,
    account,
    isDpm: data.isDpm,
  });
  const { data: estimation } = useEstimateBurn({
    outcomeId: selectedOutcome.id as `0x${string}`,
    share: toUnits(share.toString(), config.contracts.decimals.shares),
    tradingAddr: data.poolAddress,
    account,
  });
  // const { data: estimationMax } = useEstimateBurn({
  //   outcomeId: selectedOutcome.id as `0x${string}`,
  //   share: ownedShares?.[0]?.balanceRaw,
  //   tradingAddr: data.poolAddress,
  //   account,
  // });
  const usdcToGet = formatFusdc(estimation ?? BigInt(0), 2);
  const orderSummary = [
    {
      title: "AVG Price",
      value: `$${price}`,
    },
    {
      title: "Shares",
      value: share,
    },
  ];
  // const { data: positionsHistory } = usePositionHistory(account?.address, [
  //   outcome.identifier,
  // ]);
  // const historicalCost = Math.trunc(
  //   positionsHistory?.reduce((acc, v) => acc + v.fromAmount, 0) ?? 0,
  // );
  const ownedShare = ownedShares?.find((o) => o.id === outcome.identifier);
  // const costOfShare = Number(
  //   formatFusdc(
  //     Math.floor((share / Number(ownedShare?.balance ?? 0)) * historicalCost),
  //     2,
  //   ),
  // );
  // const winEstimation =
  //   estimation && costOfShare ? Number(usdcToGet) - costOfShare : 0;
  // const winSummary = [
  //   {
  //     title: "Profit",
  //     value: winEstimation,
  //     symbol: "$",
  //   },
  //   {
  //     title: "Change",
  //     value: (winEstimation / costOfShare) * 100,
  //     symbol: "%",
  //   },
  //   {
  //     title: "Multiplier",
  //     value: winEstimation / costOfShare,
  //     symbol: "x",
  //   },
  // ];
  async function handleSell(input: FormData) {
    try {
      setIsSelling(true);
      if (enabledPaymaster) {
        await sellWithPaymaster(input.shareToBurn, estimation);
      } else {
        await sell(account!, input.shareToBurn, input.minUsdcToGet);
      }
    } finally {
      setIsSelling(false);
    }
  }
  function handleFocus() {
    if (!account) connect();
  }
  const setToMaxShare = async () => {
    const balance = (await simulateTransaction({
      transaction: prepareContractCall({
        contract: getContract({
          abi: ERC20Abi,
          address: outcome.share.address,
          chain: config.destinationChain,
          client: thirdweb.client,
        }),
        method: "balanceOf",
        params: [account!.address],
      }),
    })) as bigint;
    const maxShareAmountNum = Number(
      formatUnits(balance, config.contracts.decimals.shares),
    );
    setValue("shareToBurn", maxShareAmountNum);
  };
  const onSubmit = () => (!account ? connect() : handleSubmit(handleSell)());

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
            <div
              className={combineClass(
                minimized ? "hidden" : "flex",
                "items-center justify-between md:flex",
              )}
            >
              <span className="font-chicago text-xs font-normal text-9black">
                Shares to sell
              </span>
              <div className="flex items-center gap-2">
                <span className="font-geneva text-xs font-normal text-9black/50">
                  {formatUnits(
                    ownedShare?.balanceRaw ?? BigInt(0),
                    config.contracts.decimals.shares,
                  )}
                </span>
                <Button
                  disabled={shouldStopAction || !account}
                  onClick={setToMaxShare}
                  intent={"default"}
                  size={"small"}
                  title="Max"
                />
              </div>
            </div>
            <div className="flex gap-2.5">
              <Input
                {...register("shareToBurn")}
                type="number"
                min={0}
                step="any"
                max={Number.MAX_SAFE_INTEGER}
                onFocus={handleFocus}
                className={combineClass(
                  "h-[42px] w-full flex-1 text-center",
                  errors.shareToBurn && "border-2 border-red-500",
                )}
              />
            </div>
            {errors.shareToBurn && (
              <ErrorInfo text={errors.shareToBurn.message} />
            )}
          </div>
          {/* <div
            className={combineClass(minimized && "hidden", "flex-col md:flex")}
          >
            <div className="flex items-center justify-between">
              <span className="font-chicago text-xs font-normal text-9black">
                Min USDC to Get
              </span>
            </div>
            <Input
              {...register("minUsdcToGet")}
              type="number"
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              placeholder="0"
              onFocus={handleFocus}
              className={combineClass(
                "mt-2 w-full flex-1 text-center",
                errors.minUsdcToGet && "border-2 border-red-500",
              )}
            />
            {errors.minUsdcToGet && (
              <ErrorInfo text={errors.minUsdcToGet.message} />
            )}
          </div> */}
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
          {Number(share) ? (
            <div
              className={combineClass(
                minimized && "hidden",
                "flex-col gap-4 bg-9gray p-5 text-xs shadow-9orderSummary md:flex",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-chicago uppercase">To Receive 💵</span>
                <span className="bg-9green px-1 py-0.5 font-chicago text-lg">
                  ${usdcToGet}
                </span>
              </div>
              {/* <ul className="flex flex-col gap-1 text-gray-500">
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
              </ul> */}
            </div>
          ) : null}
          <Button
            disabled={isSelling || isConnecting || shouldStopAction}
            title={isSelling ? "Loading.." : "Sell"}
            className={"uppercase"}
            size={"xlarge"}
            intent={"no"}
            onClick={onSubmit}
          />
        </div>
      </ShadowCard>
    </>
  );
}
