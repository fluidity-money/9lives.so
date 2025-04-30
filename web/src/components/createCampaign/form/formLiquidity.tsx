import { Field } from "@headlessui/react";
import Label from "@/components/themed/label";
import { combineClass } from "@/utils/combineClass";
import { fieldClass } from "../createCampaignForm";
import ErrorInfo from "@/components/themed/errorInfo";
import { FieldError, UseFormRegister } from "react-hook-form";
import Input from "@/components/themed/input";
export default function CreateCampaignFormLiquidity({
  register,
  error,
}: {
  register: UseFormRegister<{ seedLiquidity: number } & any>;
  error?: FieldError;
}) {
  return (
    <Field className={fieldClass}>
      <Label text="Seed Liquidity" />
      <p className="text-xs">
        Optionally you can add a seed liquidity to your campaign. Campaigns with
        0 liquidity can not be traded on the market.
      </p>
      <Input
        {...register("seedLiquidity")}
        type="number"
        className={combineClass(error && "border-2 border-red-500")}
      />
      {error && <ErrorInfo text={error.message} />}
    </Field>
  );
}
