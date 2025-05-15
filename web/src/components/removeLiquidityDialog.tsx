import { useForm } from "react-hook-form";
import Button from "./themed/button";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FormEvent, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { Account } from "thirdweb/wallets";
import useLiquidity from "@/hooks/useLiquidity";
import { Field } from "@headlessui/react";
import { fieldClass } from "./createCampaign/createCampaignForm";
import Input from "./themed/input";
import { combineClass } from "@/utils/combineClass";
import ErrorInfo from "./themed/errorInfo";
import formatFusdc from "@/utils/formatFusdc";

export default function RemoveLiquidityDialog({
  name,
  close,
  campaignId,
  tradingAddr,
  liquidity,
}: {
  name: string;
  close: () => void;
  campaignId: `0x${string}`;
  tradingAddr: `0x${string}`;
  liquidity: string;
}) {
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const [isLoading, setIsLoading] = useState(false);
  const maxLiquidity = Number(formatFusdc(+liquidity, 6));
  const formSchema = z.object({
    liquidity: z.preprocess(
      (val) => Number(val),
      z.number().min(0).max(maxLiquidity),
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
      liquidity: maxLiquidity,
    },
  });
  const { remove } = useLiquidity({
    campaignId,
    tradingAddr,
  });
  const onSubmit = async (input: FormData, account: Account) => {
    try {
      setIsLoading(true);
      await remove(account!, input.liquidity.toString());
      close();
    } finally {
      setIsLoading(false);
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
      <p className="text-center font-chicago text-base">
        Remove Liquidity from The Campaign
      </p>
      <p className="text-center font-chicago text-base">{name}</p>
      <p className="text-center text-xs">
        You can remove your liquidity shares and earn provider rewards.
      </p>
      <p className="text-center font-chicago text-xl">{`${maxLiquidity} Shares`}</p>
      <Field className={fieldClass}>
        <div className="flex gap-2.5">
          <Input
            {...register("liquidity")}
            type="number"
            min={0}
            className={combineClass(
              errors.liquidity && "border-2 border-red-500",
              "flex-1",
            )}
          />
        </div>
        {errors.liquidity && <ErrorInfo text={errors.liquidity.message} />}
      </Field>
      <Button
        intent={"no"}
        title={isLoading ? "Loading..." : "Remove Liquidity"}
        size={"xlarge"}
        disabled={isLoading}
        onClick={handleSubmitWithAccount}
      />
    </div>
  );
}
