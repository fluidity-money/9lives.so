import { useForm } from "react-hook-form";
import Button from "./themed/button";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FormEvent, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { Account } from "thirdweb/wallets";
import { Field } from "@headlessui/react";
import Label from "./themed/label";
import AssetSelector from "./assetSelector";
import Input from "./themed/input";
import { combineClass } from "@/utils/combineClass";
import ErrorInfo from "./themed/errorInfo";
import useSell from "@/hooks/useSell";
import { Outcome } from "@/types";
import config from "@/config";
import formatFusdc from "@/utils/formatFusdc";

export default function SellDialog({
  name,
  close,
  shareAddr,
  tradingAddr,
  outcomeId,
  campaignId,
  outcomes,
  maxShareAmount,
  maxUsdcValue,
}: {
  name: string;
  close: () => void;
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  campaignId: `0x${string}`;
  outcomes: Outcome[];
  maxShareAmount: string;
  maxUsdcValue: number;
}) {
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const [isSelling, setIsSelling] = useState(false);
  const maxShareAmountNum =
    Number(maxShareAmount) / Math.pow(10, config.contracts.decimals.shares);
  const formSchema = z.object({
    shareToBurn: z.preprocess(
      (val) => Number(val),
      z.number().min(0).max(maxShareAmountNum),
    ),
    minUsdcToGet: z.preprocess(
      (val) => Number(val),
      z
        .number()
        .min(0)
        .max(maxUsdcValue * 0.9),
    ),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minUsdcToGet: 1,
    },
  });
  const { sell } = useSell({
    tradingAddr,
    shareAddr,
    outcomeId,
    campaignId,
    outcomes,
  });
  const onSubmit = async (input: FormData, account: Account) => {
    try {
      setIsSelling(true);
      await sell(account!, input.shareToBurn, input.minUsdcToGet);
      close();
    } finally {
      setIsSelling(false);
    }
  };
  const handleSubmitWithAccount = (e: FormEvent) => {
    if (!account) {
      e.preventDefault();
      connect();
      return;
    }
    handleSubmit((data) => onSubmit(data, account))(e);
  };
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-chicago text-base">Sell Your Position</p>
      <p className="text-center font-chicago text-xl">{name}</p>
      <p className="text-center font-chicago text-xl">
        {maxShareAmount}#9LVS = ${formatFusdc(maxUsdcValue, 2)}
      </p>
      <p className="text-center text-xs">
        Select the amount of shares you want to sell and the minimum amount of
        USDC you want to receive.
      </p>
      <Field className={"flex flex-col gap-2.5"}>
        <Label text="Shares to Burn" required />
        <div className="flex gap-2.5">
          <AssetSelector disabled index={1} />
          <Input
            {...register("shareToBurn")}
            type="number"
            min={0}
            max={maxShareAmountNum}
            className={combineClass(
              errors.shareToBurn && "border-2 border-red-500",
              "flex-1",
            )}
          />
        </div>
        <Input
          {...register("shareToBurn")}
          type="range"
          step={0.1}
          min={0}
          max={maxShareAmountNum}
          className={combineClass(
            errors.shareToBurn && "border-2 border-red-500",
            "flex-1",
          )}
        />
        {errors.shareToBurn && <ErrorInfo text={errors.shareToBurn.message} />}
      </Field>
      <Field className={"flex flex-col gap-2.5"}>
        <Label text="Min USDC to Recieve" required />
        <div className="flex gap-2.5">
          <AssetSelector disabled index={0} />
          <Input
            {...register("minUsdcToGet")}
            type="number"
            min={0}
            max={maxUsdcValue * 0.9}
            className={combineClass(
              errors.minUsdcToGet && "border-2 border-red-500",
              "flex-1",
            )}
          />
        </div>
        <Input
          {...register("minUsdcToGet")}
          type="range"
          step={0.1}
          min={0}
          max={maxUsdcValue * 0.9}
          className={combineClass(
            errors.minUsdcToGet && "border-2 border-red-500",
            "flex-1",
          )}
        />
        {errors.minUsdcToGet && (
          <ErrorInfo text={errors.minUsdcToGet.message} />
        )}
      </Field>
      <Button
        intent={"no"}
        title={isSelling ? "Selling..." : "Sell"}
        size={"xlarge"}
        disabled={isSelling}
        onClick={handleSubmitWithAccount}
      />
    </div>
  );
}
