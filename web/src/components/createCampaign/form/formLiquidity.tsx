import { Field } from "@headlessui/react";
import Label from "@/components/themed/label";
import { combineClass } from "@/utils/combineClass";
import { fieldClass } from "../createCampaignForm";
import ErrorInfo from "@/components/themed/errorInfo";
import { FieldError, UseFormRegister } from "react-hook-form";
import Input from "@/components/themed/input";
import USDCImg from "#/images/usdc.svg";
import Image from "next/image";
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
        <div
          className={combineClass(
            "relative flex items-center gap-1 rounded-[3px] border border-9black py-2 pl-2.5 pr-8 shadow-9btnSecondaryIdle",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
          )}
        >
          <Image src={USDCImg} alt="fusdc" width={20} />
          <span className="font-chicago">{"USDC"}</span>
        </div>
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
