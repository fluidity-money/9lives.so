"use client";
import { Campaign, CampaignFilters } from "@/types";
import CampaignItem from "./campaignItem";
import { useQuery } from "@tanstack/react-query";
import { combineClass } from "@/utils/combineClass";
import { useDegenStore } from "@/stores/degenStore";
import { useEffect, useState } from "react";
import { Select } from "@headlessui/react";
import { requestCampaignList } from "@/providers/graphqlClient";
import Image from "next/image";
import Input from "../themed/input";
import CloseIcon from "#/icons/close.svg";
import SearchIcon from "#/icons/search.svg";
import LoadingIndicator from "../loadingIndicator";
export default function CampaignList() {
  const [orderBy, setOrderBy] = useState<CampaignFilters["orderBy"]>("volume");
  const [searchTermInput, setSearchTermInput] = useState("");
  const [searcTermFilter, setSearcTermFilter] = useState("");
  const { data, isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns", orderBy],
    queryFn: async () => {
      const campaigns = (await requestCampaignList(orderBy)) as Campaign[];
      return campaigns.map((campaign) => {
        campaign["isYesNo"] =
          campaign.outcomes.length === 2 &&
          campaign.outcomes.findIndex((outcome) => outcome.name === "Yes") !==
            -1 &&
          campaign.outcomes.findIndex((outcome) => outcome.name === "No") !==
            -1;
        return campaign;
      });
    },
  });
  const isDegenModeEnabled = useDegenStore((s) => s.degenModeEnabled);
  const orderByFilters: Array<[Required<CampaignFilters["orderBy"]>, string]> =
    [
      ["ending", "Ending Soon"],
      ["newest", "Newest"],
      ["volume", "Volume"],
    ];
  useEffect(() => {
    if (searchTermInput) {
      const timer = setTimeout(() => setSearcTermFilter(searchTermInput), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTermInput]);
  return (
    <>
      <div className="mb-4 flex flex-1 items-center gap-4">
        <Select
          name="order-by"
          aria-label="order-by"
          onChange={(e) =>
            setOrderBy(e.target.value as CampaignFilters["orderBy"])
          }
          value={orderBy}
          className="flex items-center self-stretch rounded-sm border border-9black px-2 py-1 font-chicago text-xs shadow-9btnSecondaryIdle focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
        >
          {orderByFilters.map(([key, title]) => (
            <option key={key} value={key}>
              Sort: {title}
            </option>
          ))}
        </Select>
        <div className="relative flex flex-1 items-center">
          <Image
            src={SearchIcon}
            alt=""
            width={18}
            className="absolute left-2"
          />
          <Input
            value={searchTermInput}
            placeholder="Search campaigns"
            onChange={(e) => setSearchTermInput(e.target.value)}
            className={"flex-1 pl-8"}
          />
          {searchTermInput ? (
            <Image
              src={CloseIcon}
              alt=""
              width={20}
              className="absolute right-1 cursor-pointer"
              onClick={() => {
                setSearcTermFilter("");
                setSearchTermInput("");
              }}
            />
          ) : null}
        </div>
      </div>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <div
          className={combineClass(
            "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4",
            !isDegenModeEnabled && "sm:grid-cols-2",
          )}
        >
          {data?.map((campaign) => (
            <CampaignItem key={campaign.identifier} data={campaign} />
          ))}
        </div>
      )}
    </>
  );
}
