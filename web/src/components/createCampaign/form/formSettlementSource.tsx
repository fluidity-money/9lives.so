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
import { FieldErrors, UseFormRegister } from "react-hook-form";

function SourceWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border border-black p-5 shadow-9selectedOutcome">
      {children}
    </div>
  );
}
type CreateCampaignFormSettlmentSourceFields = {
  urlCommitee: string;
  contractAddress: string;
};
export default function CreateCampaignFormSettlmentSource({
  setSettlementType,
  register,
  errors,
}: {
  errors: FieldErrors<CreateCampaignFormSettlmentSourceFields>;
  register: UseFormRegister<CreateCampaignFormSettlmentSourceFields & any>;
  setSettlementType: React.Dispatch<React.SetStateAction<SettlementType>>;
}) {
  return (
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
                Beauty contest: outcome is determined by the weighting of fUSDC
                in different outcomes. Useful for situations where an oracle may
                be inappropriate. The default setting for any new campaign.
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
                webpage. This could include a political party announcing defeat
                during an election.
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
        </TabPanels>
      </TabGroup>
    </Field>
  );
}