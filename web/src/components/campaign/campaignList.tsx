"use client";
import { Campaign, CampaignDto, CampaignFilters } from "@/types";
import CampaignItem from "./campaignItem";
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
import { useInfiniteQuery } from "@tanstack/react-query";
import Button from "../themed/button";

export default function CampaignList() {
  const [orderBy, setOrderBy] = useState<CampaignFilters["orderBy"]>("volume");
  const [searchTermInput, setSearchTermInput] = useState("");
  const [searcTermFilter, setSearcTermFilter] = useState("");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<Campaign[]>({
      queryKey: ["campaigns", orderBy, searcTermFilter],
      queryFn: async ({ pageParam }) => {
        if (typeof pageParam !== "number") return [];
        const campaigns = (await requestCampaignList({
          orderBy,
          searchTerm: searcTermFilter,
          page: pageParam,
          pageSize: pageParam === 0 ? 32 : 8,
        })) as Campaign[];
        return campaigns.map((campaign) => new CampaignDto(campaign));
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages, lastPageParam) => {
        if (lastPageParam === 0 && lastPage.length < 32) return undefined;
        if (lastPage.length < 8) return undefined;
        if (typeof lastPageParam !== "number") return undefined;
        if (lastPageParam === 0) return 4;
        return lastPageParam + 1;
      },
    });
  const campaigns = data?.pages.flatMap((c) => c);
  const isDegenModeEnabled = useDegenStore((s) => s.degenModeEnabled);
  const orderByFilters: Array<[Required<CampaignFilters["orderBy"]>, string]> =
    [
      ["ending", "Ending Soon"],
      ["ended", "Ended Recently"],
      ["newest", "Newest"],
      ["volume", "Volume"],
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
          className="flex items-center self-stretch rounded-sm border border-9black px-2 py-1 font-chicago text-xs shadow-9btnSecondaryIdle focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
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
      {isLoading ? (
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
