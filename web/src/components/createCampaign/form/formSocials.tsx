import { FieldErrors, UseFormRegister } from "react-hook-form";
import { fieldClass } from "../createCampaignForm";
import { Field } from "@headlessui/react";
import Label from "@/components/themed/label";
import Image from "next/image";
import Input from "@/components/themed/input";
import { combineClass } from "@/utils/combineClass";
import TelegramIcon from "#/icons/telegram.svg";
import ErrorInfo from "@/components/themed/errorInfo";
import XIcon from "#/icons/x-twitter.svg";
import GlobeInactiveIcon from "#/icons/globe-black.svg";

type CreateCampaignFormSocialsFields = {
  telegram: string;
  x: string;
  web: string;
};
export default function CreateCampaignFormSocials({
  register,
  errors,
}: {
  register: UseFormRegister<CreateCampaignFormSocialsFields & any>;
  errors: FieldErrors<CreateCampaignFormSocialsFields>;
}) {
  return (
    <>
      <Field className={fieldClass}>
        <Label text="Creator Social Links" />
        <div className="flex items-center gap-5">
          <Image src={TelegramIcon} width={24} className="ml-2.5" alt="" />
          <Input
            type="text"
            {...register("telegram")}
            placeholder="Telegram username @"
            className={combineClass(
              errors.telegram && "border-2 border-red-500",
              "flex-1",
            )}
          />
        </div>
        {errors.telegram && <ErrorInfo text={errors.telegram.message} />}
      </Field>
      <Field className={fieldClass}>
        <div className="flex items-center gap-5">
          <Image src={XIcon} width={24} className="ml-2.5" alt="" />
          <Input
            type="text"
            {...register("x")}
            placeholder="X/Twitter username @"
            className={combineClass(
              errors.x && "border-2 border-red-500",
              "flex-1",
            )}
          />
        </div>
        {errors.x && <ErrorInfo text={errors.x.message} />}
      </Field>
      <Field className={fieldClass}>
        <div className="flex items-center gap-5">
          <Image src={GlobeInactiveIcon} width={24} className="ml-2.5" alt="" />
          <Input
            type="url"
            {...register("web")}
            placeholder="Website"
            className={combineClass(
              errors.web && "border-2 border-red-500",
              "flex-1",
            )}
          />
        </div>
        {errors.web && <ErrorInfo text={errors.web.message} />}
      </Field>
    </>
  );
}
