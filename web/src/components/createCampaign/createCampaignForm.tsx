"use client";
import Button from "@/components/themed/button";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import Modal from "../themed/modal";
import Funding from "../fundingBalanceDialog";
import { Account } from "thirdweb/wallets";
import CreateCampaignFormLiquidity from "./form/formLiquidity";
import config from "@/config";
import { useUserStore } from "@/stores/userStore";
import useCreateWithRelay from "@/hooks/useCreateWithRelay";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import CreateCampaignFormLiquidityCrossChain from "./form/formLiquidityCrossChain";
import useTokens from "@/hooks/useTokens";

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
      const xOffset = (img.width - size) / 2;
      const yOffset = (img.height - size) / 2;
      const targetSize = 180;
      canvas.width = targetSize;
      canvas.height = targetSize;

      ctx.drawImage(
        img,
        xOffset,
        yOffset,
        size,
        size,
        0,
        0,
        targetSize,
        targetSize,
      );
      setFunc(canvas.toDataURL());
    };
  };
  reader.readAsDataURL(file);
}
export default function CreateCampaignForm() {
  const [isFundModalOpen, setFundModalOpen] = useState<boolean>(false);
  const [isLPModalOpen, setIsLPModalOpen] = useState<boolean>(false);
  const [isLPModalDisplayed, setIsLPModalDisplayed] = useState(false);
  const { create } = useCreate({ openFundModal: () => setFundModalOpen(true) });
  const { createWithRelay } = useCreateWithRelay({
    openFundModal: () => setFundModalOpen(true),
  });
  const enabledRelay = useFeatureFlag("enable relay create");
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const [outcomeType, setOutcomeType] = useState<OutcomeType>("custom");
  const [pictureBlob, setPictureBlob] = useState<string>();
  const defaultSeedLiquidity = 1;
  const [outcomeImageBlobs, setOutcomeImageBlobs] = useState<
    (string | undefined)[]
  >([]);
  const [settlementType, setSettlementType] = useState<SettlementType>("AI");
  const pictureSchema = z
    .custom<File | undefined>(
      (file) => {
        if (!file) return true;
        return file instanceof File;
      },
      { message: "You have to upload a picture" },
    )
    .refine((file) => (file ? file.size <= 1024 * 1024 : true), {
      message: "File size must be under 1MB",
    })
    .refine((file) => (file ? file.size > 0 : true), {
      message: "You have to upload a picture",
    })
    .refine(
      (file) => {
        if (!file) return true;
        const validExtensions = ["png", "jpg", "jpeg", "gif"];
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        return fileExtension && validExtensions.includes(fileExtension);
      },
      {
        message: "File must be a PNG, JPG, JPEG, or GIF image.",
      },
    );
  const outcomeschema = z.object({
    picture: pictureSchema,
    name: z.string().min(3),
    seed: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  });
  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(3).max(300),
        desc: z.string().max(1000).or(z.literal("")),
        seed: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
        picture: pictureSchema,
        starting: z.string().date(),
        ending: z
          .string()
          .date()
          .refine(
            (date) => {
              const today = new Date();
              const endingDate = new Date(date);
              const diffTime = endingDate.getTime() - today.getTime();
              const diffDays = diffTime / (1000 * 3600 * 24);
              return diffDays >= 1;
            },
            {
              message: "Ending date must be at least 24 hours in the future",
            },
          ),
        telegram: z.string().min(2).max(100).optional().or(z.literal("")),
        x: z.string().min(2).max(100).optional().or(z.literal("")),
        web: z.string().url().max(200).optional().or(z.literal("")),
        outcomes:
          outcomeType === "custom"
            ? z.array(outcomeschema)
            : z.array(
                z.object({
                  picture: pictureSchema,
                  name: z.string().max(300),
                  seed: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
                }),
              ),
        toChain: z.number().min(0),
        toToken: z.string(),
        fromChain: z
          .number({ message: "You need to select a chain to pay from" })
          .min(0),
        fromToken: z.string({
          message: "You need to select a token to pay with",
        }),
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
        seedLiquidity: z.coerce
          .number()
          .gt(0, { message: "Invalid amount to spend" }),
      }),
    [outcomeType, outcomeschema, pictureSchema, settlementType],
  );
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      desc: "",
      seed: randomValue4Uint8(),
      picture: undefined,
      starting: new Date().toISOString().split("T")[0],
      outcomes: [
        {
          name: "",
          seed: randomValue4Uint8(),
        },
        {
          name: "",
          seed: randomValue4Uint8(),
        },
      ],
      toChain: config.chains.superposition.id,
      toToken: config.NEXT_PUBLIC_FUSDC_ADDR,
      fromChain: isInMiniApp
        ? config.chains.arbitrum.id
        : config.chains.superposition.id,
      fromToken: config.NEXT_PUBLIC_FUSDC_ADDR,
      seedLiquidity: defaultSeedLiquidity,
    },
  });
  const fields = watch();
  const fillForm = useFormStore((s) => s.fillForm);
  const debouncedFillForm = useDebounce(fillForm, 1); // 1 second delay for debounce
  const { data: tokens, isSuccess: isTokensSuccess } = useTokens(
    fields.fromChain,
  );
  const fromDecimals = tokens?.find(
    (t) => t.address === fields.fromToken,
  )?.decimals;
  const onSubmit = (input: FormData, account: Account) => {
    if (input.seedLiquidity === defaultSeedLiquidity && !isLPModalDisplayed) {
      setIsLPModalOpen(true);
      setIsLPModalDisplayed(true);
      return;
    }

    let outcomes;
    if (outcomeType === "default") {
      outcomes = input.outcomes.slice(0, 2).map((o, idx) => ({
        ...o,
        name: idx === 0 ? "Yes" : "No",
        picture: undefined,
      }));
    } else {
      outcomes = input.outcomes.map((o, idx) => ({
        ...o,
        picture: outcomeImageBlobs[idx],
      }));
    }
    const preparedInput = {
      ...input,
      picture: pictureBlob,
      settlementType,
      outcomes,
    };
    if (!Boolean(preparedInput.oracleUrls?.length)) {
      delete preparedInput.oracleUrls;
    }
    enabledRelay && fields.fromChain !== config.chains.superposition.id
      ? createWithRelay({ ...preparedInput, fromDecimals }, account)
      : create(preparedInput, account);
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
        picture: pictureBlob,
        seed: 0,
        outcomeType,
        settlementType,
        outcomes: fields.outcomes.map((outcome, index) => {
          return {
            name: outcome.name,
            picture: outcomeImageBlobs[index],
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
        {enabledRelay ? (
          <CreateCampaignFormLiquidityCrossChain
            register={register}
            errors={errors}
            isTokensSuccess={isTokensSuccess}
            isInMiniApp={isInMiniApp}
            account={account}
            tokens={tokens}
            fromChain={fields.fromChain}
            fromToken={fields.fromToken}
            setValue={setValue}
            seedLiquidity={fields.seedLiquidity}
            clearErrors={clearErrors}
          />
        ) : (
          <CreateCampaignFormLiquidity
            error={errors.seedLiquidity}
            register={register}
          />
        )}
        <Button intent={"cta"} title="CONFIRM" size={"xlarge"} type="submit" />
      </form>
      <Modal
        isOpen={isFundModalOpen}
        setIsOpen={setFundModalOpen}
        title="CAMPAIGN SEED FUNDING"
      >
        <Funding
          closeModal={() => setFundModalOpen(false)}
          title={fields.name}
          type="create"
          fundToBuy={settlementType === "ORACLE" ? 4.2 : 3}
        />
      </Modal>
      <Modal
        isOpen={isLPModalOpen}
        setIsOpen={setFundModalOpen}
        title="ADD SEED LIQUIDITY"
      >
        <div className="flex flex-col gap-4">
          <p className="text-center font-chicago text-base">
            Supply More Liquidity to Your Campaign?
          </p>
          <p className="text-center font-chicago text-xl">{fields.name}</p>
          <p className="text-center text-xs">
            Higher liquidty means better trading stability and lower slippage.
            You can add liquidity to your campaign and earn provider rewards at
            any time.
          </p>
          <CreateCampaignFormLiquidity
            renderLabel={false}
            register={register}
            error={errors.seedLiquidity}
          />
          <Button
            intent={"yes"}
            title="Add Liquidity"
            size={"xlarge"}
            onClick={() => setIsLPModalOpen(false)}
          />
        </div>
      </Modal>
    </>
  );
}
