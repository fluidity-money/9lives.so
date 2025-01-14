import { Campaign, SettlementType } from "@/types";
import RetroCard from "../cardRetro";
import config from "@/config";
import Link from "next/link";
import Image from "next/image";
import LinkIcon from "#/icons/link.svg";
import ProposeOutcomeButton from "../proposeOutcomeButton";

export default function DetailInfo({ data }: { data: Campaign }) {
  const settlementDescMap: Record<SettlementType, string> = {
    ORACLE: "a 9lives Infrastructure Market",
    POLL: "an Opinion poll",
    AI: "an A.I Resolver",
    CONTRACT: "a Contract State",
  };
  const settlementContractMap: Record<SettlementType, string> = {
    ORACLE: config.NEXT_PUBLIC_INFRA_ADDR,
    POLL: config.NEXT_PUBLIC_BEAUTY_ADDR,
    AI: config.NEXT_PUBLIC_AI_ADDR,
    CONTRACT: "0x", // not ready yet
  };
  return (
    <>
      <RetroCard
        title="Rules & Resources"
        showClose={false}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2.5">
          <h5 className="font-chicago text-sm">Overview</h5>
          <p className="ml-5 text-xs">{data.description}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <h5 className="font-chicago text-sm">Settlement</h5>
          <div className="ml-5 flex flex-col gap-2.5">
            <p className="text-xs">
              Settlement of this trade is completed with{" "}
              {settlementDescMap[data.settlement] ??
                settlementDescMap["ORACLE"]}
              .
            </p>
            {data.oracleDescription && data.settlement === "ORACLE" ? (
              <p className="text-xs">{data.oracleDescription}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <h5 className="font-chicago text-sm">Links & Resources</h5>{" "}
            {data.settlement === "ORACLE" ? (
              <ProposeOutcomeButton
                title={data.name}
                ending={data.ending}
                outcomes={data.outcomes}
                tradingAddr={data.poolAddress}
              />
            ) : null}
          </div>
          <div className="ml-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-1">
              <Image src={LinkIcon} alt="" width={16} />
              <h6 className="text-xs">Settlement source:</h6>
              <Link
                className="text-xs underline"
                rel="noopener noreferrer"
                target="_blank"
                href={`https://explorer.superposition.so/address/${settlementContractMap[data.settlement] ?? settlementContractMap["ORACLE"]}`}
              >
                {settlementContractMap[data.settlement] ??
                  settlementContractMap["ORACLE"]}
              </Link>
            </div>
            <ul className="flex flex-col gap-2.5">
              {data.oracleUrls?.map((url) =>
                url ? (
                  <li
                    key={url.slice(-8)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image src={LinkIcon} alt="" width={16} />
                    <Link
                      className="text-xs underline"
                      rel="noopener noreferrer"
                      target="_blank"
                      href={url}
                    >
                      {url}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </div>
      </RetroCard>
      <RetroCard title="Creator" showClose={false}>
        <h5 className="mb-5 font-chicago text-sm">Creator</h5>
        <p className="ml-5 text-xs">
          This was created by{" "}
          <Link
            rel="noopener noreferrer"
            target="_blank"
            className="text-xs underline"
            href={`https://explorer.superposition.so/address/${data.creator?.address}`}
          >
            {data.creator?.address}
          </Link>
        </p>
      </RetroCard>
    </>
  );
}
