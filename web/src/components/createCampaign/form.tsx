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
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
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
import Link from "next/link";
import RightCaretIcon from "#/icons/right-caret.svg";
import SourceWrapper from "./settlementSource";

export default function CreateCampaignForm() {
  const onSubmit = (data: any) => console.log(data);
  const fieldClass = "flex flex-col gap-2.5";
  const inputStyle = "shadow-9input border border-9black bg-9gray";
  const customOutcomes = Array.from({ length: 2 });
  const formSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(5),
    picture: z.string(),
    endDate: z.date(),
    telegram: z.string().min(2).optional().or(z.literal("")),
    x: z.string().min(2).optional().or(z.literal("")),
    web: z.string().url().optional().or(z.literal("")),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
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
          {...register("description")}
          className={combineClass(
            errors.description && "border-2 border-red-500",
          )}
          placeholder="Description"
        />
        {errors.description && <ErrorInfo text={errors.description.message} />}
      </Field>
      <Field className={fieldClass}>
        <Label text="Campaign Type & Outcomes" required />
        <TabGroup>
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
              {customOutcomes.map((_, idx) => (
                <Field
                  className={"flex flex-col gap-2.5"}
                  key={"outcome" + idx}
                >
                  <Label text={`Outcome ${idx + 1}`} required />
                  <div className="flex gap-2.5">
                    <input type="file" hidden />
                    <div
                      className={combineClass(
                        inputStyle,
                        "flex size-10 flex-col items-center justify-center",
                      )}
                    >
                      <Image
                        src={UploadIcon}
                        alt=""
                        width={20}
                        className="h-auto"
                      />
                      <p className="font-geneva text-[8px]">PIC</p>
                    </div>
                    <Input className={"flex-1"} placeholder="Outcome name" />
                  </div>
                </Field>
              ))}
              <Button
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
          {...register("picture")}
          className={combineClass(errors.picture && "border-2 border-red-500")}
          hidden
        />
        <div
          className={combineClass(
            inputStyle,
            "flex h-[120px] flex-col items-center justify-center gap-1.5",
          )}
        >
          <div className="flex items-center gap-1.5">
            <Image src={UploadIcon} width={20} className="h-auto" alt="" />
            <span className="font-chicago text-xs">Upload Here</span>
          </div>
          <p className="font-geneva text-[10px] uppercase">
            Formats: GIF, PNG, JPG, JPEG.
          </p>
        </div>
        {errors.picture && <ErrorInfo text={errors.picture.message} />}
      </Field>
      <Field className={fieldClass}>
        <Label text="End Date" required />
        <Input
          type="date"
          {...register("endDate")}
          className={combineClass(
            errors.endDate && "border-2 border-red-500",
            "text-center uppercase",
          )}
        />
        {errors.endDate && <ErrorInfo text={errors.endDate.message} />}
      </Field>
      <Field className={fieldClass}>
        <Label text="Select Settlement Source" required />
        <TabGroup selectedIndex={1}>
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
            <Tab as={Fragment}>
              {(props) => (
                <TabIconButton
                  title="Contract State"
                  activeIcon={ContractIcon}
                  inactiveIcon={ContractIcon}
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
                  More Info <Image src={RightCaretIcon} width={14} alt="" />
                </Link>
              </SourceWrapper>
            </TabPanel>
            <TabPanel className={"flex flex-col gap-4"}>
              <SourceWrapper>
                <Input
                  placeholder="Enter URL Here"
                  className="text-center"
                  type="url"
                />
                <p className="text-xs">
                  URL committee: outcome is determined by the contents of a
                  webpage. This could include a political party announcing
                  defeat during an election.
                </p>
                <Link
                  className="flex gap-2 font-chicago text-xs underline"
                  href={"#"}
                >
                  More Info <Image src={RightCaretIcon} width={14} alt="" />
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
                  More Info <Image src={RightCaretIcon} width={14} alt="" />
                </Link>
                <Input placeholder="Contract Address of Asset" type="text" />
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