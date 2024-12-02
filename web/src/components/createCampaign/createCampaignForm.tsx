"use client";
import Button from "@/components/themed/button";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useFormStore } from "@/stores/formStore";
import useDebounce from "@/hooks/useDebounce";
import { OutcomeType, SettlementType } from "@/types";
import CreateCampaignFormName from "./form/formName";
import CreateCampaignFormDescription from "./form/formDesc";
import CreateCampaignFormOutcomes from "./form/formOutcomes";
import CreateCampaignFormPicture from "./form/formPic";
import CreateCampaignFormEndDate from "./form/formEndDate";
import CreateCampaignFormSettlmentSource from "./form/formSettlementSource";
import CreateCampaignFormSocials from "./form/formSocials";

export const fieldClass = "flex flex-col gap-2.5";
export const inputStyle = "shadow-9input border border-9black bg-9gray";
export function onFileChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setFunc: React.Dispatch<string | undefined>,
) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    setFunc(reader.result?.toString());
  };
  reader.readAsDataURL(file!);
}
export default function CreateCampaignForm() {
  const onSubmit = (data: any) => console.log(data);
  const [outcomeType, setOutcomeType] = useState<OutcomeType>("default");
  const [pictureBlob, setPictureBlob] = useState<string>();
  const [outcomeImageBlobs, setOutcomeImageBlobs] = useState<
    (string | undefined)[]
  >([]);
  const [settlementType, setSettlementType] = useState<SettlementType>("url");
  const outcomeschema = z.object({
    picture: z
      .instanceof(File, {
        message: "You have to upload a picture",
      })
      .refine((file) => file.size <= 1024 * 1024, {
        message: "File size must be under 1MB",
      })
      .refine((file) => file.size > 0, {
        message: "You have to upload a picture",
      }),
    name: z.string().min(3),
    description: z.string().min(5),
  });
  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(3),
        desc: z.string().min(5),
        picture: z
          .instanceof(File, { message: "You have to upload a picture" })
          .refine((file) => file.size <= 1024 * 1024, {
            message: "File size must be under 1MB",
          }),
        starting: z.string().date(),
        ending: z.string().date(),
        telegram: z.string().min(2).optional().or(z.literal("")),
        x: z.string().min(2).optional().or(z.literal("")),
        web: z.string().url().optional().or(z.literal("")),
        outcomes:
          outcomeType === "custom"
            ? z.array(outcomeschema)
            : z.array(
                z.object({
                  picture: z.instanceof(File),
                  name: z.string(),
                  description: z.string(),
                }),
              ),
        urlCommitee:
          settlementType === "url" ? z.string().url() : z.undefined(),
        contractAddress:
          settlementType === "contract"
            ? z.string().startsWith("0x").min(42)
            : z.undefined(),
      }),
    [outcomeType, outcomeschema, settlementType],
  );
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      starting: new Date().toISOString().split("T")[0],
      outcomes: [
        { name: "", description: "", picture: new File([], "") },
        { name: "", description: "", picture: new File([], "") },
      ],
    },
  });
  const fields = watch();
  const fillForm = useFormStore((s) => s.fillForm);
  const debouncedFillForm = useDebounce(fillForm, 1); // 1 second delay for debounce
  useEffect(() => {
    if (fields) {
      debouncedFillForm({
        ...fields,
        picture: pictureBlob ?? "",
        outcomeType,
        settlementType,
        outcomes: fields.outcomes.map((outcome, index) => {
          return {
            name: outcome.name,
            description: outcome.description,
            picture: outcomeImageBlobs[index] ?? "",
          };
        }),
      });
    }
  }, [
    fields,
    pictureBlob,
    debouncedFillForm,
    outcomeImageBlobs,
    outcomeType,
    settlementType,
  ]);
  return (
    <form
      className="relative flex flex-[2] flex-col gap-7 p-0.5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="absolute inset-0 z-10 bg-9layer/75" />
      <CreateCampaignFormName
        register={register}
        error={errors.name}
        setValue={setValue}
      />
      <CreateCampaignFormDescription register={register} error={errors.desc} />
      <CreateCampaignFormOutcomes
        register={register}
        control={control}
        errors={errors}
        outcomeType={outcomeType}
        setOutcomeType={setOutcomeType}
        outcomeImageBlobs={outcomeImageBlobs}
        setOutcomeImageBlobs={setOutcomeImageBlobs}
        setValue={setValue}
      />
      <CreateCampaignFormPicture
        register={register}
        error={errors.picture}
        pictureBlob={pictureBlob}
        setPictureBlob={setPictureBlob}
        setValue={setValue}
      />
      {/* <Field className={fieldClass}>
        <Label text="Start Date" required />
        <Input
          type="date"
          {...register("starting")}
          className={combineClass(
            errors.starting && "border-2 border-red-500",
            "text-center uppercase",
          )}
        />
        {errors.starting && <ErrorInfo text={errors.starting.message} />}
      </Field> */}
      <CreateCampaignFormEndDate register={register} error={errors.ending} />
      <CreateCampaignFormSettlmentSource
        register={register}
        errors={errors}
        setSettlementType={setSettlementType}
      />
      <CreateCampaignFormSocials register={register} errors={errors} />
      <Button intent={"cta"} title="CONFIRM" size={"xlarge"} type="submit" />
    </form>
  );
}
