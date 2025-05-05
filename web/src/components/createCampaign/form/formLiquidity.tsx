import { Field } from "@headlessui/react";
import Label from "@/components/themed/label";
import { combineClass } from "@/utils/combineClass";
import { fieldClass } from "../createCampaignForm";
import ErrorInfo from "@/components/themed/errorInfo";
import { FieldError, UseFormRegister } from "react-hook-form";
import Input from "@/components/themed/input";
import AssetSelector from "@/components/assetSelector";
export default function CreateCampaignFormLiquidity({
  register,
  error,
  renderLabel = true,
}: {
  register: UseFormRegister<{ seedLiquidity: number } & any>;
  error?: FieldError;
  renderLabel?: boolean;
}) {
  return (
    <Field className={fieldClass}>
      {renderLabel && <Label text="Seed Liquidity" required />}
      <div className="flex gap-2.5">
        <AssetSelector />
        <Input
          {...register("seedLiquidity")}
          type="number"
          min={1}
          className={combineClass(error && "border-2 border-red-500", "flex-1")}
        />
      </div>
      {error && <ErrorInfo text={error.message} />}
    </Field>
  );
}
