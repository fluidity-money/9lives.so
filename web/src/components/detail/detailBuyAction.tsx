import Button from "@/components/themed/button";
import React, { useEffect, useState } from "react";
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
import { prepareContractCall, simulateTransaction } from "thirdweb";
import config from "@/config";
import { formatUnits } from "ethers";
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
  const [isFundModalOpen, setFundModalOpen] = useState<boolean>(false);
  const { connect, isConnecting } = useConnectWallet();
  const account = useActiveAccount();
  const outcome = selectedOutcome
    ? data.outcomes.find((o) => o.identifier === selectedOutcome.id)!
    : data.outcomes[0];
  const ctaTitle = selectedOutcome?.state === "sell" ? "Sell" : "Buy";
  const [isMinting, setIsMinting] = useState(false);
  const formSchema = z.object({
    fusdc: z.coerce
      .number()
      .gte(0.1, { message: "Invalid usdc to spend, min 0.1$ necessary" }),
  });
  const chanceAmm = Number(price) * 100;
  const dpmChance = useDpmChances({
    investmentAmounts: data.investmentAmounts,
    totalVolume: data.totalVolume,
    outcomeIds: [selectedOutcome.id as `0x${string}`],
  })?.[0]?.chance;
  const chance = isDpm ? dpmChance : chanceAmm;
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    disabled: shouldStopAction,
    resolver: zodResolver(formSchema),
    defaultValues: {
      fusdc: 0,
    },
  });
  const fusdc = watch("fusdc");
  const { buy } = useBuy({
    tradingAddr: data.poolAddress,
    shareAddr: outcome.share.address,
    campaignId: data.identifier,
    outcomeId: outcome.identifier,
    openFundModal: () => setFundModalOpen(true),
  });
  const { data: estimatedSharesToGet } = useReturnValue({
    outcomeId: outcome.identifier,
    shareAddr: outcome.share.address,
    tradingAddr: data.poolAddress,
    fusdc: fusdc,
  });
  const sharesToGet = formatFusdc(estimatedSharesToGet ?? 0, 2);
  const estimatedWinForDpm = usePotentialReturn({
    totalInvestment: data.totalVolume,
    investmentAmounts: data.investmentAmounts,
    outcomeId: outcome.identifier,
    fusdc,
    share: fusdc / Number(price),
  });
  const orderSummary = [
    {
      title: "AVG Price",
      value: `$${isDpm ? price : (isNaN(fusdc / +sharesToGet) ? 0 : fusdc / +sharesToGet).toFixed(2)}`,
    },
    {
      title: "Shares To Get",
      value: isDpm ? (fusdc / Number(price)).toFixed(2) : sharesToGet,
    },
    {
      title: "To Win 💵",
      value: `$${isDpm ? estimatedWinForDpm : sharesToGet}`,
    },
  ];
  async function handleBuy({ fusdc }: FormData) {
    try {
      setIsMinting(true);
      await buy(account!, fusdc, data.outcomes);
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
    setValue("fusdc", maxfUSDC);
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
            <div className="flex gap-2.5">
              <div className={combineClass(minimized && "hidden md:block")}>
                <AssetSelector disabled />
              </div>
              <Input
                {...register("fusdc")}
                type="number"
                min={0}
                max={Number.MAX_SAFE_INTEGER}
                value={fusdc}
                placeholder="0"
                onFocus={handleFocus}
                onChange={(e) => {
                  const fusdc =
                    Number(e.target.value) >= Number.MAX_SAFE_INTEGER
                      ? Number.MAX_SAFE_INTEGER
                      : Number(e.target.value);
                  setValue("fusdc", fusdc);
                  if (fusdc > 0) clearErrors();
                }}
                className={combineClass(
                  "w-full flex-1 text-center",
                  errors.fusdc && "border-2 border-red-500",
                )}
              />
            </div>
            {errors.fusdc && <ErrorInfo text={errors.fusdc.message} />}
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
          fundToBuy={fusdc}
        />
      </Modal>
    </>
  );
}
