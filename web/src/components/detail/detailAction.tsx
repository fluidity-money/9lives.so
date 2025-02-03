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
import Funding from "../funding";
import DownIcon from "#/icons/down-caret.svg";
import useChances from "@/hooks/useChances";

export default function DetailCall2Action({
  shouldStopAction,
  data,
  selectedOutcome,
  price,
}: {
  shouldStopAction: boolean;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  data: CampaignDetail;
  price: string;
}) {
  const [minimized, setMinimized] = useState(true);
  const [isFundModalOpen, setFundModalOpen] = useState<boolean>(false);
  const [share, setShare] = useState<number>(0);
  const [fusdc, setFusdc] = useState<number>(0);
  const { connect, isConnecting } = useConnectWallet();
  const account = useActiveAccount();
  const outcome = selectedOutcome
    ? data.outcomes.find((o) => o.identifier === selectedOutcome.id)!
    : data.outcomes[0];
  const outcomeIds = data.outcomes.map((o) => o.identifier);
  const ctaTitle = selectedOutcome?.state === "sell" ? "Sell" : "Buy";
  const [isMinting, setIsMinting] = useState(false);
  const formSchema = z.object({
    share: z.coerce.number().gt(0, { message: "Invalid share to buy" }),
    fusdc: z.coerce
      .number()
      .gte(0.1, { message: "Invalid usdc to spend, min 0.1$ necessary" }),
  });
  const chances = useChances({
    investmentAmounts: data.investmentAmounts,
    totalVolume: data.totalVolume,
    outcomeIds,
  });
  const chance = chances?.find(
    (chance) => chance.id === outcome.identifier,
  )!.chance;
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    disabled: shouldStopAction,
    resolver: zodResolver(formSchema),
    defaultValues: {
      share: 0,
      fusdc: 0,
    },
  });
  const { buy } = useBuy({
    tradingAddr: data.poolAddress,
    shareAddr: outcome.share.address,
    campaignId: data.identifier,
    outcomeId: outcome.identifier,
    openFundModal: () => setFundModalOpen(true),
  });
  const estimatedReturn = usePotentialReturn({
    totalInvestment: data.totalVolume,
    investmentAmounts: data.investmentAmounts,
    outcomeId: outcome.identifier,
    fusdc,
    share,
  });
  const estimatedReturnPerc = (
    ((estimatedReturn - fusdc) / fusdc) *
    100
  ).toFixed(2);
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
    const share = maxfUSDC / Number(price);
    setShare(share);
    setValue("share", share);
    setFusdc(maxfUSDC);
    setValue("fusdc", maxfUSDC);
    if (maxfUSDC > 0) clearErrors();
  };
  const onSubmit = () => (!account ? connect() : handleSubmit(handleBuy)());

  useEffect(() => {
    setFusdc(0);
    setShare(0);
    setValue("fusdc", 0);
    setValue("share", 0);
  }, [price, setValue]);

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
          <div className="flex flex-col gap-1">
            <h3 className="font-chicago text-base font-normal text-9black">
              {outcome.name}
            </h3>
            <div className="flex items-center gap-1 font-geneva text-xs uppercase">
              <span>Chance</span>
              <span className="bg-9green px-1 py-0.5">
                {chance?.toFixed(0) ?? "?"}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
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
              <AssetSelector />
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
                  const share = fusdc / Number(price);
                  setShare(share);
                  setValue("share", share);
                  setFusdc(fusdc);
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
            className={combineClass(minimized && "hidden", "flex-col md:flex")}
          >
            <div className="flex items-center justify-between">
              <span className="font-chicago text-xs font-normal text-9black">
                Shares to buy
              </span>
            </div>
            <Input
              {...register("share")}
              type="number"
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              value={share}
              placeholder="0"
              onFocus={handleFocus}
              onChange={(e) => {
                const share =
                  Number(e.target.value) >= Number.MAX_SAFE_INTEGER
                    ? Number.MAX_SAFE_INTEGER
                    : Number(e.target.value);
                const fusdc = share * Number(price);
                setShare(share);
                setValue("share", share);
                setFusdc(fusdc);
                setValue("fusdc", fusdc);
                if (share > 0) clearErrors();
              }}
              className={combineClass(
                "mt-2 w-full flex-1 text-center",
                errors.share && "border-2 border-red-500",
              )}
            />
            {errors.share && <ErrorInfo text={errors.share.message} />}
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
