"use client";
import { CampaignFilters } from "@/types";
import CampaignItem from "./campaignItem";
import { combineClass } from "@/utils/combineClass";
import { useDegenStore } from "@/stores/degenStore";
import { Dispatch, useEffect, useState } from "react";
import { Select } from "@headlessui/react";
import Image from "next/image";
import Input from "../themed/input";
import CloseIcon from "#/icons/close.svg";
import SearchIcon from "#/icons/search.svg";
import LoadingIndicator from "../loadingIndicator";
import Button from "../themed/button";
import config from "@/config";
import useCampaigns from "@/hooks/useCampaigns";
import ErrorIndicator from "../errorIndicator";

export default function CampaignList({
  category,
  orderBy,
  setOrderBy,
  address,
}: {
  category?: (typeof config.categories)[number];
  orderBy: CampaignFilters["orderBy"];
  setOrderBy: Dispatch<CampaignFilters["orderBy"]>;
  address?: string;
}) {
  const [searchTermInput, setSearchTermInput] = useState("");
  const [searcTermFilter, setSearcTermFilter] = useState("");
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCampaigns({ category, orderBy, searchTerm: searcTermFilter, address });
  const campaigns = data?.pages.flatMap((c) => c);
  const isDegenModeEnabled = useDegenStore((s) => s.degenModeEnabled);
  const orderByFilters: Array<[Required<CampaignFilters["orderBy"]>, string]> =
    [
      ["trending", "Trending"],
      ["volume", "Volume"],
      ["newest", "Newest"],
      ["ending", "Ending Soon"],
      ["ended", "Ended Recently"],
      ["liquidity", "Liquidity"],
    ];
  useEffect(() => {
    const timer = setTimeout(() => setSearcTermFilter(searchTermInput), 300);
    return () => clearTimeout(timer);
  }, [searchTermInput]);
  return (
    <>
      <div className="mb-4 flex flex-1 flex-col items-center gap-4 sm:flex-row">
        <Select
          name="order-by"
          aria-label="order-by"
          onChange={(e) =>
            setOrderBy(e.target.value as CampaignFilters["orderBy"])
          }
          value={orderBy}
          className="flex min-h-[36px] items-center self-stretch rounded-sm border border-9black px-2 py-1 font-chicago text-xs shadow-9btnSecondaryIdle focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
        >
          {orderByFilters.map(([key, title]) => (
            <option key={key} value={key}>
              Sort: {title}
            </option>
          ))}
        </Select>
        <div className="relative flex flex-1 items-center self-stretch">
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
      {isError ? (
        <ErrorIndicator />
      ) : isLoading ? (
        <LoadingIndicator />
      ) : campaigns?.length === 0 ? (
        <div className="flex items-center justify-center">
          <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
            No results found
          </span>
        </div>
      ) : (
        <>
          <div
            className={combineClass(
              "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4",
              !isDegenModeEnabled && "sm:grid-cols-2",
            )}
          >
            {campaigns?.map((campaign) => (
              <CampaignItem key={campaign.identifier} data={campaign} />
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            {hasNextPage ? (
              <Button
                intent={"cta"}
                disabled={isFetchingNextPage}
                title={isFetchingNextPage ? "Loading" : "Show More"}
                onClick={() => fetchNextPage()}
              />
            ) : (
              <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
                End of results
              </span>
            )}
          </div>
        </>
      )}
    </>
  );
}
