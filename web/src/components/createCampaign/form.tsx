"use client";

import TabRadioButton from "@/components/tabRadioButton";
import Button from "@/components/themed/button";
import ErrorInfo from "@/components/themed/errorInfo";
import Input from "@/components/themed/input";
import Label from "@/components/themed/label";
import {
  Field,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React, {
  Fragment,
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import TelegramIcon from "#/icons/telegram.svg";
import XIcon from "#/icons/x-twitter.svg";
import GlobeInactiveIcon from "#/icons/globe-black.svg";
import GlobeActiveIcon from "#/icons/globe.svg";
import { combineClass } from "@/utils/combineClass";
import UploadIcon from "#/icons/upload.svg";
import TabIconButton from "@/components/tabIconButton";
import LipsActiveIcon from "#/images/lips.svg";
import LipsInactiveIcon from "#/images/lips-black.svg";
import ContractIcon from "#/images/contract.svg";
import ContractBlackIcon from "#/images/contract-black.svg";
import AIActiveIcon from "#/icons/ai.svg";
import AIInactiveIcon from "#/icons/ai-black.svg";
import Link from "next/link";
import RightCaretIcon from "#/icons/right-caret.svg";
import SourceWrapper from "./settlementSource";
import { useFormStore } from "@/stores/formStore";
import useDebounce from "@/hooks/useDebounce";
import { OutcomeType, SettlementType } from "@/types";

export default function CreateCampaignForm() {
  const onSubmit = (data: any) => console.log(data);
  const fieldClass = "flex flex-col gap-2.5";
  const inputStyle = "shadow-9input border border-9black bg-9gray";
  const [outcomeType, setOutcomeType] = useState<OutcomeType>("default");
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
    [outcomeType, settlementType],
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
      outcomes: [
        { name: "", description: "", picture: new File([], "") },
        { name: "", description: "", picture: new File([], "") },
      ],
    },
  });
  const {
    fields: outcomes,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "outcomes",
    rules: {
      required: outcomeType === "custom",
      minLength: 2,
    },
  });
  const fields = watch();
  const fillForm = useFormStore((s) => s.fillForm);
  const debouncedFillForm = useDebounce(fillForm, 1);
  const [pictureBlob, setPictureBlob] = useState<string>();
  const [outcomeImageBlobs, setOutcomeImageBlobs] = useState<
    (string | undefined)[]
  >([]);
  const pictureInputRef = useRef<HTMLInputElement | null>(null);
  const customOutcomePicturesRef = useRef<
    Array<MutableRefObject<HTMLInputElement | null>>
  >(Array.from({ length: 2 }, () => React.createRef<HTMLInputElement>()));
  function handlePickPicture() {
    pictureInputRef.current?.click();
  }
  function onFileChange(
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
  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e, setPictureBlob);
    const file = e.target.files?.[0];
    if (file) {
      setValue("picture", file);
    }
  };
  const handleOutcomePicChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    onFileChange(e, (val?: string) =>
      setOutcomeImageBlobs((prev) => {
        const arr = [...prev];
        arr[idx] = val;
        return arr;
      }),
    );
    const file = e.target.files?.[0];
    if (file) {
      setValue(`outcomes.${idx}.picture`, file);
    }
  };
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
            picture: outcomeImageBlobs[index],
          };
        }),
      });
    }
  }, [fields, pictureBlob, debouncedFillForm, outcomeImageBlobs]);

  return (
    <form
      className="relative flex flex-[2] flex-col gap-7 p-0.5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="absolute inset-0 z-10 bg-9layer/75" />
      <Field className={fieldClass}>
        <Label text="Campaign Name" required />
        <Input
          {...register("name")}
          className={combineClass(errors.name && "border-2 border-red-500")}
          placeholder="Name"
        />
        {errors.name && <ErrorInfo text={errors.name.message} />}
      </Field>
      <Field className={fieldClass}>
        <Label text="Campaign Description" required />
        <Input
          type="textarea"
          {...register("desc")}
          className={combineClass(errors.desc && "border-2 border-red-500")}
          placeholder="Description"
        />
        {errors.desc && <ErrorInfo text={errors.desc.message} />}
      </Field>
      <Field className={fieldClass}>
        <Label text="Campaign Type & Outcomes" required />
        <TabGroup
          defaultIndex={0}
          onChange={(idx) => setOutcomeType(idx === 0 ? "default" : "custom")}
        >
          <TabList className="flex gap-2.5">
            <Tab as={Fragment}>
              {(props) => <TabRadioButton title="Yes / No" {...props} />}
            </Tab>
            <Tab as={Fragment}>
              {(props) => <TabRadioButton title="Custom Outcomes" {...props} />}
            </Tab>
          </TabList>
          <TabPanels className={"mt-4"}>
            <TabPanel>
              <div className="flex flex-1 gap-2.5">
                <Button
                  intent={"yes"}
                  size={"xlarge"}
                  title="Yes"
                  className="flex-1"
                />
                <Button
                  intent={"no"}
                  size={"xlarge"}
                  title="No"
                  className="flex-1"
                />
              </div>
            </TabPanel>
            <TabPanel className={"flex flex-col gap-4"}>
              {outcomes.map((field, idx) => (
                <Field className={"flex flex-col gap-2.5"} key={field.id}>
                  <Label text={`Outcome ${idx + 1}`} required={idx < 2} />
                  <div className="flex gap-2.5">
                    <input
                      type="file"
                      hidden
                      {...register(`outcomes.${idx}.picture`, {
                        onChange: (e) => handleOutcomePicChange(e, idx),
                      })}
                      ref={(el) => {
                        register(`outcomes.${idx}.picture`).ref(el);
                        if (customOutcomePicturesRef.current[idx])
                          customOutcomePicturesRef.current[idx].current = el;
                      }}
                    />
                    <div
                      onClick={() => {
                        customOutcomePicturesRef.current[idx].current?.click();
                      }}
                      className={combineClass(
                        inputStyle,
                        "flex size-10 cursor-pointer flex-col items-center justify-center",
                        errors.outcomes?.[idx]?.picture &&
                          "border-2 border-red-500",
                      )}
                    >
                      {outcomeImageBlobs[idx] ? (
                        <Image
                          src={outcomeImageBlobs[idx]}
                          width={40}
                          height={40}
                          alt=""
                          className="size-10 bg-white object-contain"
                        />
                      ) : (
                        <>
                          <Image
                            src={UploadIcon}
                            alt=""
                            width={20}
                            className="h-auto"
                          />
                          <p className="font-geneva text-[8px]">PIC</p>
                        </>
                      )}
                    </div>
                    <Input
                      className={combineClass(
                        "flex-1",
                        errors.outcomes?.[idx]?.name &&
                          "border-2 border-red-500",
                      )}
                      placeholder="Outcome name"
                      {...register(`outcomes.${idx}.name`)}
                    />
                    <Input
                      className={combineClass(
                        "flex-1",
                        errors.outcomes?.[idx]?.description &&
                          "border-2 border-red-500",
                      )}
                      placeholder="Outcome description"
                      {...register(`outcomes.${idx}.description`)}
                    />
                    {idx > 1 && (
                      <Button
                        title="Del"
                        onClick={() => {
                          remove(idx);
                          customOutcomePicturesRef.current =
                            customOutcomePicturesRef.current.filter(
                              (_, i) => i !== idx,
                            );
                          setOutcomeImageBlobs((prev) => {
                            const arr = [...prev];
                            arr.splice(idx, 1);
                            return arr;
                          });
                        }}
                        size={"small"}
                        intent={"no"}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {errors.outcomes?.[idx]?.picture ? (
                      <ErrorInfo
                        text={errors.outcomes?.[idx]?.picture.message}
                      />
                    ) : null}
                    {errors.outcomes?.[idx]?.name ? (
                      <ErrorInfo text={errors.outcomes?.[idx]?.name.message} />
                    ) : null}
                    {errors.outcomes?.[idx]?.description ? (
                      <ErrorInfo
                        text={errors.outcomes?.[idx]?.description.message}
                      />
                    ) : null}
                  </div>
                </Field>
              ))}
              <Button
                onClick={() => {
                  customOutcomePicturesRef.current.push(
                    React.createRef<HTMLInputElement>(),
                  );
                  append({
                    name: "",
                    description: "",
                    picture: new File([], ""),
                  });
                }}
                intent={"default"}
                size={"large"}
                title="Add More Outcomes +"
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Field>
      <Field className={fieldClass}>
        <Label text="Campaign Picture" required />
        <Input
          type="file"
          {...register("picture", {
            onChange: handlePicChange,
          })}
          ref={(el) => {
            register("picture").ref(el);
            pictureInputRef.current = el;
          }}
          hidden
        />
        <div
          onClick={handlePickPicture}
          className={combineClass(
            inputStyle,
            "flex h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5",
            errors.picture && "border-2 border-red-500",
          )}
        >
          {pictureBlob ? (
            <Image
              src={pictureBlob}
              alt=""
              height={120}
              width={120}
              className="h-[120px] w-auto object-contain"
            />
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Image src={UploadIcon} width={20} className="h-auto" alt="" />
                <span className="font-chicago text-xs">Upload Here</span>
              </div>
              <p className="font-geneva text-[10px] uppercase">
                Formats: GIF, PNG, JPG, JPEG.
              </p>
            </>
          )}
        </div>
        {errors.picture && <ErrorInfo text={errors.picture.message} />}
      </Field>
      <Field className={fieldClass}>
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
      </Field>
      <Field className={fieldClass}>
        <Label text="End Date" required />
        <Input
          type="date"
          {...register("ending")}
          className={combineClass(
            errors.ending && "border-2 border-red-500",
            "text-center uppercase",
          )}
        />
        {errors.ending && <ErrorInfo text={errors.ending.message} />}
      </Field>
      <Field className={fieldClass}>
        <Label text="Select Settlement Source" required />
        <TabGroup
          defaultIndex={1}
          onChange={(idx) => {
            switch (idx) {
              case 0:
                setSettlementType("beauty");
                break;
              case 1:
                setSettlementType("url");
                break;
              case 2:
                setSettlementType("contract");
                break;
              case 3:
                setSettlementType("ai");
                break;
              default:
                return;
            }
          }}
        >
          <TabList className="flex gap-2.5">
            <Tab as={Fragment}>
              {(props) => (
                <TabIconButton
                  title="Beauty Contest"
                  activeIcon={LipsActiveIcon}
                  inactiveIcon={LipsInactiveIcon}
                  {...props}
                />
              )}
            </Tab>
            <Tab as={Fragment}>
              {(props) => (
                <TabIconButton
                  title="Url Commitee"
                  activeIcon={GlobeActiveIcon}
                  inactiveIcon={GlobeInactiveIcon}
                  {...props}
                />
              )}
            </Tab>
            <Tab disabled as={Fragment}>
              {(props) => (
                <TabIconButton
                  title="Contract State"
                  activeIcon={ContractIcon}
                  inactiveIcon={ContractBlackIcon}
                  {...props}
                />
              )}
            </Tab>
            <Tab disabled as={Fragment}>
              {(props) => (
                <TabIconButton
                  title="A.I Resolver"
                  activeIcon={AIActiveIcon}
                  inactiveIcon={AIInactiveIcon}
                  {...props}
                />
              )}
            </Tab>
          </TabList>
          <TabPanels className={"mt-4"}>
            <TabPanel>
              <SourceWrapper>
                <p className="text-xs">
                  Beauty contest: outcome is determined by the weighting of
                  fUSDC in different outcomes. Useful for situations where an
                  oracle may be inappropriate. The default setting for any new
                  campaign.
                </p>
                <Link
                  className="mt-2 flex gap-2 font-chicago text-xs underline"
                  href={"#"}
                >
                  More Info{" "}
                  <Image
                    src={RightCaretIcon}
                    alt=""
                    className="h-[15px] w-[14px]"
                  />
                </Link>
              </SourceWrapper>
            </TabPanel>
            <TabPanel>
              <SourceWrapper>
                <Input
                  placeholder="Enter URL Here"
                  className={combineClass(
                    "text-center",
                    errors.urlCommitee && "border-2 border-red-500",
                  )}
                  type="url"
                  {...register("urlCommitee")}
                />
                {errors.urlCommitee && (
                  <ErrorInfo text={errors.urlCommitee.message} />
                )}
                <p className="text-xs">
                  URL committee: outcome is determined by the contents of a
                  webpage. This could include a political party announcing
                  defeat during an election.
                </p>
                <Link
                  className="flex gap-2 font-chicago text-xs underline"
                  href={"#"}
                >
                  More Info{" "}
                  <Image
                    src={RightCaretIcon}
                    alt=""
                    className="h-[15px] w-[14px]"
                  />
                </Link>
              </SourceWrapper>
            </TabPanel>
            <TabPanel>
              <SourceWrapper>
                <p className="text-xs">
                  Contract state: A specific contract is used to finalise
                  results when called at a point in time. This could include
                  retrieving price data, the amount of volume traded, or the
                  results of on-chain voting. This is gradually filled out by
                  the community.
                </p>
                <Link
                  className="flex gap-2 font-chicago text-xs underline"
                  href={"#"}
                >
                  More Info{" "}
                  <Image
                    src={RightCaretIcon}
                    alt=""
                    className="h-[15px] w-[14px]"
                  />
                </Link>
                <Input
                  placeholder="Contract Address of Asset"
                  type="text"
                  className={combineClass(
                    "flex gap-2 font-chicago text-xs underline",
                    errors.contractAddress && "border-2 border-red-500",
                  )}
                />
                {errors.contractAddress && (
                  <ErrorInfo text={errors.contractAddress.message} />
                )}
              </SourceWrapper>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Field>
      <Field className={fieldClass}>
        <Label text="Social Links" />
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
      <Button intent={"cta"} title="CONFIRM" size={"xlarge"} type="submit" />
    </form>
  );
}
