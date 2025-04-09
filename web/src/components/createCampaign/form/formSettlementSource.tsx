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
import Image from "next/image";
import React, { Fragment } from "react";
import GlobeInactiveIcon from "#/icons/globe-black.svg";
import GlobeActiveIcon from "#/icons/globe.svg";
import { combineClass } from "@/utils/combineClass";
import TabIconButton from "@/components/tabIconButton";
import LipsActiveIcon from "#/images/lips.svg";
import LipsInactiveIcon from "#/images/lips-black.svg";
import ContractIcon from "#/images/contract.svg";
import ContractBlackIcon from "#/images/contract-black.svg";
import AIActiveIcon from "#/icons/ai.svg";
import AIInactiveIcon from "#/icons/ai-black.svg";
import Link from "next/link";
import RightCaretIcon from "#/icons/right-caret.svg";
import { fieldClass } from "../createCampaignForm";
import { SettlementType } from "@/types";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormTrigger,
} from "react-hook-form";
import Textarea from "@/components/themed/textarea";
import Button from "@/components/themed/button";

function SourceWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border border-black p-5 shadow-9selectedOutcome">
      {children}
    </div>
  );
}
type CreateCampaignFormSettlmentSourceFields = {
  oracleDescription: string;
  contractAddress: string;
  oracleUrls: string[];
};
export default function CreateCampaignFormSettlmentSource({
  setSettlementType,
  register,
  trigger,
  errors,
  control,
}: {
  errors: FieldErrors<CreateCampaignFormSettlmentSourceFields>;
  trigger: UseFormTrigger<CreateCampaignFormSettlmentSourceFields & any>;
  register: UseFormRegister<CreateCampaignFormSettlmentSourceFields & any>;
  setSettlementType: React.Dispatch<React.SetStateAction<SettlementType>>;
  control: Control<CreateCampaignFormSettlmentSourceFields & any>;
}) {
  const {
    fields: urls,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "oracleUrls",
    rules: {
      required: false,
      maxLength: 3,
    },
  });
  return (
    <Field className={fieldClass}>
      <Label text="Select Settlement Source" required />
      <TabGroup
        defaultIndex={3}
        onChange={(idx) => {
          switch (idx) {
            case 0:
              setSettlementType("POLL");
              break;
            case 1:
              setSettlementType("ORACLE");
              break;
            case 2:
              setSettlementType("CONTRACT");
              break;
            case 3:
              setSettlementType("AI");
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
                title="Opinion Poll"
                activeIcon={LipsActiveIcon}
                inactiveIcon={LipsInactiveIcon}
                {...props}
              />
            )}
          </Tab>
          <Tab disabled as={Fragment}>
            {(props) => (
              <TabIconButton
                title="Oracle"
                activeIcon={GlobeActiveIcon}
                inactiveIcon={GlobeInactiveIcon}
                {...props}
                className="opacity-30"
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
                className="opacity-30"
              />
            )}
          </Tab>
          <Tab as={Fragment}>
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
                Opinion Poll: winner is determined by which outcome has the most
                fUSDC invested in it. This is useful for opinion gauging!
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
              <p className="text-xs">
                Winner is determined with an infra market!
              </p>
              <Field className={"flex flex-col gap-2.5"}>
                <Label text={"Oracle"} required={true} />
                <Textarea
                  placeholder="Enter Oracle description"
                  className={combineClass(
                    "text-left",
                    errors.oracleDescription && "border-2 border-red-500",
                  )}
                  {...register("oracleDescription")}
                />
                {errors.oracleDescription && (
                  <ErrorInfo text={errors.oracleDescription.message} />
                )}
              </Field>
              {errors.oracleDescription && (
                <>
                  {" "}
                  <p className="text-xs">
                    A good description is one that answers the following:
                  </p>
                  <ul className="list-inside list-disc pl-4">
                    <li>
                      <span className="text-xs">
                        Under what circumstances should this resolve?
                      </span>
                    </li>
                    <li>
                      <span className="text-xs">
                        Which websites (ideally 3) should determine the outcome
                        of this prediction market?
                      </span>
                    </li>
                  </ul>
                </>
              )}
              {urls.map((field, idx) => (
                <Field className={"flex flex-col gap-2.5"} key={field.id}>
                  <Label text={`Oracle Url ${idx + 1}`} />
                  <div className="flex gap-2.5">
                    <Input
                      {...register(`oracleUrls.${idx}`)}
                      placeholder="Enter a url as a settlement source"
                      className={combineClass(
                        "flex-1",
                        errors.oracleUrls?.[idx] && "border-2 border-red-500",
                      )}
                    />{" "}
                    <Button
                      title="Del"
                      onClick={() => remove(idx)}
                      size={"small"}
                      intent={"no"}
                    />
                  </div>
                  {errors.oracleUrls?.[idx] ? (
                    <ErrorInfo text={errors.oracleUrls?.[idx].message} />
                  ) : null}
                </Field>
              ))}
              <Button
                disabled={urls.length >= 3}
                onClick={async () => {
                  if (await trigger("oracleUrls")) append("");
                }}
                intent={"default"}
                size={"large"}
                title="Add Oracle Url +"
              />
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
                Contract state: A specific contract is used to finalise results
                when called at a point in time. This could include retrieving
                price data, the amount of volume traded, or the results of
                on-chain voting. This is gradually filled out by the community.
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
          <TabPanel>
            <SourceWrapper>
              <p className="text-xs">
                Enable Sarp AI to make a informed decision based on the
                description given.
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
        </TabPanels>
      </TabGroup>
    </Field>
  );
}
