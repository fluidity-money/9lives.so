import Button from "@/components/themed/button";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import Input from "../themed/input";
import { Outcome, SelectedOutcome } from "@/types";
import useBuy from "@/hooks/useBuy";
import { useActiveAccount } from "thirdweb/react";
import useReturnValue from "@/hooks/useReturnValue";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import useConnectWallet from "@/hooks/useConnectWallet";
import TrumpImg from "#/images/trump.webp";
import KamalaImg from "#/images/kamala.webp";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import config from "@/config";
import { formatUnits } from "ethers";
export default function DetailCall2Action({
  tradingAddr,
  initalData,
  selectedOutcome,
  setSelectedOutcome,
  price,
}: {
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  tradingAddr: `0x${string}`;
  initalData: Outcome[];
  price: string;
}) {
  const [share, setShare] = useState<number>(0);
  const [fusdc, setFusdc] = useState<number>(0);
  const { connect, isConnecting } = useConnectWallet();
  const account = useActiveAccount();
  const outcome = selectedOutcome
    ? initalData.find((o) => o.identifier === selectedOutcome.id)!
    : initalData[0];
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
  const { data: estimatedReturn } = useReturnValue({
    tradingAddr,
    fusdc,
    shareAddr: outcome.share.address,
    outcomeId: outcome.identifier,
  });
  const orderSummary = [
    {
      title: "AVG Price",
      value: price,
    },
    {
      title: "Shares",
      value: share,
    },
    {
      title: "Return",
      value: estimatedReturn ?? "0",
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
    <div className="sticky top-0 flex flex-col gap-4 rounded-[3px] border border-9black bg-9layer p-4 shadow-9card">
      <div className="flex items-center gap-4">
        <div className="size-10 overflow-hidden rounded-full">
          <Image
            width={40}
            height={40}
            alt={outcome.name}
            src={
              outcome.identifier === "0x5c96f5316cd9172c" ? TrumpImg : KamalaImg
            }
            className="size-full object-cover"
          />
        </div>
        <h3 className="font-chicago text-base font-normal text-9black">
          {outcome.name}
        </h3>
      </div>
      <div>
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
            onClick={() =>
              window.open(`https://app.camelot.exchange/?token1=${outcome.share.address}`, "_blank", "noopener,noreferrer")
              //setSelectedOutcome({ ...selectedOutcome, state: "sell" })
            }
          />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <span className="font-chicago text-xs font-normal text-9black">
            fUSDC to spend
          </span>
          {account ? (
            <Button
              onClick={setToMaxShare}
              intent={"default"}
              size={"small"}
              title="Max"
            />
          ) : null}
        </div>
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
            "mt-2 flex-1 text-center",
            errors.fusdc && "border-2 border-red-500",
          )}
        />
        {errors.fusdc && (
          <span className="mt-1 text-xs text-red-500">
            {errors.fusdc.message}
          </span>
        )}
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
        {errors.share && (
          <span className="mt-1 text-xs text-red-500">
            {errors.share.message}
          </span>
        )}
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
        disabled={isMinting || isConnecting}
        title={isMinting ? "Loading.." : ctaTitle}
        className={"uppercase"}
        size={"xlarge"}
        intent={"cta"}
        onClick={onSubmit}
      />
    </div>
  );
}
