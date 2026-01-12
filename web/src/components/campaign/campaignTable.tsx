"use client";
import { CampaignFilters } from "@/types";
import { Dispatch, useEffect, useState } from "react";
import { Select } from "@headlessui/react";
import Image from "next/image";
import Input from "../themed/input";
import CloseIcon from "#/icons/close.svg";
import SearchIcon from "#/icons/search.svg";
import Button from "../themed/button";
import config from "@/config";
import useCampaigns from "@/hooks/useCampaigns";
import Placeholder from "../tablePlaceholder";
import CampaignTableItem from "./campaignTableItem";
import ClaimFeesButton from "../claimFeesButton";

export default function CampaignTable({
  category,
  orderBy,
  setOrderBy,
  address,
  userList = false,
}: {
  category?: (typeof config.categories)[number];
  orderBy: CampaignFilters["orderBy"];
  setOrderBy: Dispatch<CampaignFilters["orderBy"]>;
  address?: string;
  userList?: boolean;
}) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const bodyStyles = "min-h-24 bg-9gray";
  const headers = [
    "Campaign",
    "End Date",
    "Total Vol.",
    "Unclaimed Fees",
    "Actions",
  ];
  const [searchTermInput, setSearchTermInput] = useState("");
  const [searcTermFilter, setSearcTermFilter] = useState("");
  const {
    data,
    isLoading,
    isError,
    isSuccess,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCampaigns({
    category,
    orderBy,
    searchTerm: searcTermFilter,
    address,
    userList,
  });
  const campaigns = data?.pages.flatMap((c) => c);
  const orderByFilters: Array<[Required<CampaignFilters["orderBy"]>, string]> =
    [
      ["newest", "Newest"],
      ["ending", "Ending Soon"],
      ["ended", "Ended"],
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
      {isSuccess && campaigns && campaigns.length > 1 ? (
        <div className="mb-2 flex justify-end">
          <ClaimFeesButton
            addresses={campaigns.map((c) => c.poolAddress)}
            multiple
          />
        </div>
      ) : null}
      <table className="w-full table-auto border-separate border-spacing-y-1">
        <thead>
          <tr className="font-geneva">
            {headers.map((key) => (
              <th className={tableHeaderClasses} key={key}>
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={bodyStyles}>
          {isError ? (
            <Placeholder
              colSpan={headers.length}
              title="Whoops, error!"
              subtitle={error.message}
            />
          ) : isLoading ? (
            <Placeholder title="Loading.." colSpan={headers.length} />
          ) : campaigns?.length === 0 ? (
            <Placeholder
              colSpan={headers.length}
              title="Nothing yet."
              subtitle="Start Growing Your Portfolio."
            />
          ) : (
            <>
              {campaigns?.map((campaign) => (
                <CampaignTableItem
                  key={campaign.identifier}
                  data={campaign}
                  address={address}
                />
              ))}
              <tr>
                <td colSpan={headers.length}>
                  <div className="flex items-center justify-center">
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
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </>
  );
}
