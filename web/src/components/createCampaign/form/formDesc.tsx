import { Field } from "@headlessui/react";
import Input from "@/components/themed/input";
import Label from "@/components/themed/label";
import { combineClass } from "@/utils/combineClass";
import { fieldClass } from "../createCampaignForm";
import ErrorInfo from "@/components/themed/errorInfo";
import { FieldError, UseFormRegister } from "react-hook-form";
export default function CreateCampaignFormDescription({
  register,
  error,
}: {
  register: UseFormRegister<{ desc: string } & any>;
  error?: FieldError;
}) {
  return (
    <Field className={fieldClass}>
      <Label text="Campaign Description" required />
      <Input
        type="textarea"
        {...register("desc")}
        className={combineClass(error && "border-2 border-red-500")}
        placeholder="Description"
      />
      {error && <ErrorInfo text={error.message} />}
    </Field>
  );
}
