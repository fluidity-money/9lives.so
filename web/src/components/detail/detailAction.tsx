import Button from "@/components/themed/button";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import Input from "../themed/input";
import { Outcome, SelectedOutcome } from "@/types";
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
import Link from "next/link";
import LinkIcon from "#/icons/link.svg";
export default function DetailCall2Action({
  shouldStopAction,
  tradingAddr,
  initalData,
  selectedOutcome,
  setSelectedOutcome,
  price,
  isYesNo,
}: {
  shouldStopAction: boolean;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  tradingAddr: `0x${string}`;
  initalData: Outcome[];
  price: string;
  isYesNo: boolean;
}) {
  const [share, setShare] = useState<number>(0);
  const [fusdc, setFusdc] = useState<number>(0);
  const { connect, isConnecting } = useConnectWallet();
  const account = useActiveAccount();
  const outcome = selectedOutcome
    ? initalData.find((o) => o.identifier === selectedOutcome.id)!
    : initalData[0];
  const outcomeIds = initalData.map((o) => o.identifier);
  const ctaTitle = selectedOutcome?.state === "sell" ? "Sell" : "Buy";
  const [isMinting, setIsMinting] = useState(false);
  const formSchema = z.object({
    share: z.coerce.number().gt(0, { message: "Invalid share to buy" }),
    fusdc: z.coerce.number().gt(0, { message: "Invalid fusdc to spend" }),
  });
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
    tradingAddr,
    shareAddr: outcome.share.address,
    outcomeId: outcome.identifier,
  });
  const estimatedReturn = usePotentialReturn({
    tradingAddr,
    outcomeIds,
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
      title: "Creator Fee",
      value: `-$${fusdc * 0.05} (-5%)`,
    },
    {
      title: "Protocol Fee",
      value: `-$${fusdc * 0.02} (-2%)`,
    },
    {
      title: "Shares",
      value: share,
    },
    {
      title: "Potential Return",
      value: estimatedReturn
        ? `$${estimatedReturn} (${estimatedReturnPerc}%)`
        : "$0",
    },
  ];
  async function handleBuy({ fusdc }: FormData) {
    try {
      setIsMinting(true);
      await buy(account!, fusdc, initalData);
    } finally {
      setIsMinting(false);
    }
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

  return (
    <ShadowCard className="sticky top-0 z-10 flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <div
          className={combineClass(
            !isYesNo && "size-10 overflow-hidden rounded-full",
          )}
        >
          <Image
            width={40}
            height={40}
            alt={outcome.name}
            src={
              isYesNo
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
            <span className="bg-9green px-1 py-0.5">50%</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Link
          href={`#`}
          // target="_blank"
          // rel="noopener,noreferrer"
          className="contents"
        >
          <Button size={"medium"} className={"flex-1"}>
            <div className="flex items-center justify-center gap-1">
              <span className="font-chicago text-sm uppercase">
                Trade Position
              </span>
              <Image src={LinkIcon} alt="" width={14} />
            </div>
          </Button>
        </Link>
        <Link
          href={`https://long.so/stake/pool?id=${outcome.share.address}`}
          target="_blank"
          rel="noopener,noreferrer"
          className="contents"
        >
          <Button
            size={"medium"}
            disabled={shouldStopAction}
            className={"flex-1"}
          >
            <div className="flex items-center justify-center gap-1">
              <span className="font-chicago text-sm uppercase">Provide LP</span>
              <Image src={LinkIcon} alt="" width={14} />
            </div>
          </Button>
        </Link>
      </div>
      {/* <div>
        <span className="font-chicago text-xs font-normal text-9black">
          Outcome
        </span>
        <div className="mt-2 flex items-center gap-2">
          <Button
            title="Mint"
            intent={selectedOutcome?.state === "buy" ? "yes" : "default"}
            size={"large"}
            className={combineClass(
              selectedOutcome?.state === "buy" &&
              "bg-green-500 text-white hover:bg-green-500",
              "flex-1",
            )}
            onClick={() =>
              setSelectedOutcome({ ...selectedOutcome, state: "buy" })
            }
          />
          <Button
            title="Trade"
            intent={selectedOutcome?.state === "sell" ? "no" : "default"}
            size={"large"}
            className={combineClass(
              selectedOutcome?.state === "sell" &&
              "bg-red-500 text-white hover:bg-red-500",
              "flex-1",
            )}
            onClick={
              () =>
                window.open(
                  `https://long.so/stake/pool?id=${outcome.share.address}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              //setSelectedOutcome({ ...selectedOutcome, state: "sell" })
            }
          />
        </div>
      </div> */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
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
              "flex-1 text-center",
              errors.fusdc && "border-2 border-red-500",
            )}
          />
        </div>

        {errors.fusdc && <ErrorInfo text={errors.fusdc.message} />}
      </div>
      <div className="flex flex-col">
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
            "mt-2 flex-1 text-center",
            errors.share && "border-2 border-red-500",
          )}
        />
        {errors.share && <ErrorInfo text={errors.share.message} />}
      </div>
      <div className="flex flex-col">
        <span className="font-chicago text-xs font-normal text-9black">
          Leverage
        </span>
        <Input type="range" intent="range" className={"mt-2 w-full"} disabled />
      </div>
      <div className="flex flex-col gap-4 bg-9gray p-5 text-xs shadow-9orderSummary">
        <span className="font-chicago uppercase">Order Summary</span>
        <ul className="flex flex-col gap-1 text-gray-500">
          {orderSummary.map((item) => (
            <li className="flex items-center justify-between" key={item.title}>
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
    </ShadowCard>
  );
}
