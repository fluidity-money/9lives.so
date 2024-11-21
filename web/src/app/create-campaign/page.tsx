"use client";
import RetroCard from "@/components/cardRetro";
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
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import TelegramIcon from "#/icons/telegram.svg";
import XIcon from "#/icons/x-twitter.svg";
import GlobeIcon from "#/icons/globe.svg";
import { combineClass } from "@/utils/combineClass";

export default function CreateCampaign() {
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

  const fieldClass = "flex flex-col gap-2.5";
  const onSubmit = (data: any) => console.log(data);

  return (
    <div className="flex flex-1 flex-col gap-7">
      <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="font-chicago text-2xl">Create Campaign</h2>
        <p className="text-center text-xs">
          This is where you can create your own campaign for other people to
          participate in! {"\n"}
          Lorem ipsum dolor sit amet vadum omet. Lorem ipsum dolor sit amet
          vadum omet.
        </p>
      </div>
      <div className="flex gap-7">
        <form
          className="flex flex-[2] flex-col gap-7"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Field className={fieldClass}>
            <Label text="Campaign Name" required />
            <Input
              {...register("name")}
              className={combineClass(errors.name && "border-2 border-red-500")}
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
            />
            {errors.description && (
              <ErrorInfo text={errors.description.message} />
            )}
          </Field>
          <TabGroup>
            <TabList className="flex gap-2.5">
              <Tab as={Fragment}>
                {(props) => <TabRadioButton title="Yes / No" {...props} />}
              </Tab>
              <Tab as={Fragment}>
                {(props) => (
                  <TabRadioButton title="Custom Outcomes" {...props} />
                )}
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="flex gap-2.5 py-4">
                  <input type="file"></input>
                  <Input className={"flex-1"} />
                </div>
                <div className="flex gap-2.5 py-4">
                  <input type="file"></input>
                  <Input className={"flex-1"} />
                </div>
              </TabPanel>
              <TabPanel>
                <div className="flex gap-2.5 py-4">
                  <input type="file"></input>
                  <Input className={"flex-1"} />
                </div>
                <div className="flex gap-2.5 py-4">
                  <input type="file"></input>
                  <Input className={"flex-1"} />
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
          <Field className={fieldClass}>
            <Label text="Campaign Picture" required />
            <Input
              type="file"
              {...register("picture")}
              className={combineClass(
                errors.picture && "border-2 border-red-500",
              )}
            />
            {errors.picture && <ErrorInfo text={errors.picture.message} />}
          </Field>
          <Field className={fieldClass}>
            <Label text="End Date" required />
            <Input
              type="date"
              {...register("endDate")}
              className={combineClass(
                errors.endDate && "border-2 border-red-500",
              )}
            />
            {errors.endDate && <ErrorInfo text={errors.endDate.message} />}
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
              <Image src={GlobeIcon} width={24} className="ml-2.5" alt="" />
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
          <Button
            intent={"cta"}
            title="CONFIRM"
            size={"xlarge"}
            type="submit"
          />
        </form>
        <div className="flex flex-1 flex-col gap-7">
          <RetroCard
            title="YOUR CAMPAIGN SUMMARY"
            position="middle"
            showClose={false}
          >
            <div></div>
          </RetroCard>
          <RetroCard title="TIPS & INSTRUCTIONS" position="middle">
            <span></span>
            <p></p>
          </RetroCard>
        </div>
      </div>
    </div>
  );
}
