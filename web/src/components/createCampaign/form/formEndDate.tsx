import { Field } from "@headlessui/react";
import { fieldClass } from "../createCampaignForm";
import Label from "@/components/themed/label";
import Input from "@/components/themed/input";
import { FieldError, UseFormRegister } from "react-hook-form";
import { combineClass } from "@/utils/combineClass";
import ErrorInfo from "@/components/themed/errorInfo";
export default function CreateCampaignFormEndDate({
  register,
  error,
}: {
  register: UseFormRegister<{ ending: string } & any>;
  error?: FieldError;
}) {
  return (
    <Field className={fieldClass}>
      <Label text="End Date" required />
      <Input
        type="date"
        {...register("ending")}
        className={combineClass(
          error && "border-2 border-red-500",
          "text-center uppercase",
        )}
      />
      {error && <ErrorInfo text={error.message} />}
    </Field>
  );
}
