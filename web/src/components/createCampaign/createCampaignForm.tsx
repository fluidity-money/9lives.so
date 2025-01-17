"use client";
import Button from "@/components/themed/button";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
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
import useCreate from "@/hooks/useCreate";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { randomValue4Uint8 } from "@/utils/generateId";
import { track, EVENTS } from "@/utils/analytics";
import Modal from "../themed/modal";
import Funding from "../funding";
import { Account } from "thirdweb/wallets";

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
    const img = new Image();
    img.src = reader.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      const xOffset = (img.width - size) / 2;
      const yOffset = (img.height - size) / 2;

      ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size);
      setFunc(canvas.toDataURL());
    };
  };
  reader.readAsDataURL(file);
}
export default function CreateCampaignForm() {
  const [isFundModalOpen, setFundModalOpen] = useState<boolean>(false);
  const { create } = useCreate({ openFundModal: () => setFundModalOpen(true) });
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const [outcomeType, setOutcomeType] = useState<OutcomeType>("custom");
  const [pictureBlob, setPictureBlob] = useState<string>();
  const [outcomeImageBlobs, setOutcomeImageBlobs] = useState<
    (string | undefined)[]
  >([]);
  const [settlementType, setSettlementType] =
    useState<SettlementType>("ORACLE");
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
      })
      .refine(
        (file) => {
          const validExtensions = ["png", "jpg", "jpeg", "gif"];
          const fileExtension = file.name.split(".").pop()?.toLowerCase();
          return fileExtension && validExtensions.includes(fileExtension);
        },
        {
          message: "File must be a PNG, JPG, JPEG, or GIF image.",
        },
      ),
    name: z.string().min(3),
    description: z.string().min(5),
    seed: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  });
  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(3).max(300),
        desc: z.string().min(5).max(1000),
        seed: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
        picture: z
          .instanceof(File, { message: "You have to upload a picture" })
          .refine((file) => file.size <= 1024 * 1024, {
            message: "File size must be under 1MB",
          }),
        starting: z.string().date(),
        ending: z.string().date(),
        telegram: z.string().min(2).max(100).optional().or(z.literal("")),
        x: z.string().min(2).max(100).optional().or(z.literal("")),
        web: z.string().url().max(200).optional().or(z.literal("")),
        outcomes:
          outcomeType === "custom"
            ? z.array(outcomeschema)
            : z.array(
                z.object({
                  picture: z.instanceof(File),
                  name: z.string().max(300),
                  description: z.string().max(1000),
                  seed: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
                }),
              ),
        oracleDescription:
          settlementType === "ORACLE"
            ? z.string().min(10).max(1000)
            : z.string().optional(),
        oracleUrls:
          settlementType === "ORACLE"
            ? z.array(z.string().url().max(200)).max(3)
            : z.array(z.string()).optional(),
        // contractAddress:
        //   settlementType === "contract"
        //     ? z.string().startsWith("0x").min(42)
        //     : z.undefined(),
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
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seed: randomValue4Uint8(),
      starting: new Date().toISOString().split("T")[0],
      outcomes: [
        {
          name: "",
          description: "",
          picture: new File([], ""),
          seed: randomValue4Uint8(),
        },
        {
          name: "",
          description: "",
          picture: new File([], ""),
          seed: randomValue4Uint8(),
        },
      ],
    },
  });
  const fields = watch();
  const fillForm = useFormStore((s) => s.fillForm);
  const debouncedFillForm = useDebounce(fillForm, 1); // 1 second delay for debounce
  const onSubmit = (input: FormData, account: Account) => {
    let outcomes;
    if (outcomeType === "default") {
      outcomes = input.outcomes.slice(0, 2).map((o, idx) => ({
        ...o,
        name: idx === 0 ? "Yes" : "No",
        description: "",
        picture: "",
      }));
    } else {
      outcomes = input.outcomes.map((o, idx) => ({
        ...o,
        picture: outcomeImageBlobs[idx]!,
      }));
    }
    const preparedInput = {
      ...input,
      picture: pictureBlob!,
      settlementType,
      outcomes,
    };
    if (!Boolean(preparedInput.oracleUrls?.length)) {
      delete preparedInput.oracleUrls;
    }
    track(EVENTS.CAMPAIGN_CREATE, {
      wallet: account.address,
      name: input.name,
      outcomeCount: outcomes.length,
      settlementType,
    });
    create(preparedInput, account);
  };
  const handleSubmitWithAccount = (e: FormEvent) => {
    if (!account) {
      e.preventDefault();
      connect();
      return;
    }
    handleSubmit((data) => onSubmit(data, account))(e);
  };
  useEffect(() => {
    if (fields) {
      debouncedFillForm({
        ...fields,
        picture: pictureBlob ?? "",
        seed: 0,
        outcomeType,
        settlementType,
        outcomes: fields.outcomes.map((outcome, index) => {
          return {
            name: outcome.name,
            description: outcome.description,
            picture: outcomeImageBlobs[index] ?? "",
            seed: 0,
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
    <>
      <form
        className="flex flex-[2] flex-col gap-7"
        onSubmit={handleSubmitWithAccount}
      >
        <CreateCampaignFormName
          register={register}
          error={errors.name}
          setValue={setValue}
        />
        <CreateCampaignFormDescription
          register={register}
          error={errors.desc}
        />
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
        <CreateCampaignFormEndDate register={register} error={errors.ending} />
        <CreateCampaignFormSettlmentSource
          control={control}
          trigger={trigger}
          register={register}
          errors={errors}
          setSettlementType={setSettlementType}
        />
        <CreateCampaignFormSocials register={register} errors={errors} />
        <Button intent={"cta"} title="CONFIRM" size={"xlarge"} type="submit" />
      </form>
      <Modal
        isOpen={isFundModalOpen}
        setIsOpen={setFundModalOpen}
        title="CAMPAIGN SEED FUNDING"
      >
        <Funding
          closeModal={() => setFundModalOpen(false)}
          isYesNo={outcomeType === "default"}
          title={fields.name}
          outcomes={fields.outcomes}
          fundToBuy={settlementType === "ORACLE" ? 4.2 : 3}
        />
      </Modal>
    </>
  );
}
