"use client";
import { Campaign, CampaignFilters } from "@/types";
import CampaignItem from "./campaignItem";
import { useQuery } from "@tanstack/react-query";
import { combineClass } from "@/utils/combineClass";
import { useDegenStore } from "@/stores/degenStore";
import { useState } from "react";
import { Select } from "@headlessui/react";
import { requestCampaignList } from "@/providers/graphqlClient";
import Image from "next/image";
import LoadingImage from "#/icons/loading.svg";
export default function CampaignList() {
  const [orderBy, setOrderBy] = useState<CampaignFilters["orderBy"]>("volume");
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
  return (
    <>
      <Select
        name="order-by"
        aria-label="order-by"
        onChange={(e) =>
          setOrderBy(e.target.value as CampaignFilters["orderBy"])
        }
        value={orderBy}
        className="mb-4 rounded-sm border border-9black px-2 py-1 font-chicago text-xs shadow-9btnSecondaryIdle focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
      >
        {orderByFilters.map(([key, title]) => (
          <option key={key} value={key}>
            {title}
          </option>
        ))}
      </Select>
      {isLoading ? (
        <div className="h-100 flex items-center justify-center">
          <Image
            src={LoadingImage}
            className="animate-spin"
            alt="Loading"
            width={16}
          />
          <span className="ml-2 font-geneva text-sm">Loading...</span>
        </div>
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
