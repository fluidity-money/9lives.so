import { SettlementType } from "@/types";
import RetroCard from "../cardRetro";
import config from "@/config";
import Link from "next/link";

export default function DetailInfo({
  desc,
  settlement,
  creator,
  oracleDescription,
}: {
  desc: string;
  settlement: SettlementType;
  creator: string;
  oracleDescription: string | null;
}) {
  const settlementDescMap: Record<SettlementType, string> = {
    ORACLE: "a 9lives Infrastructure Market",
    POLL: "an Opinion poll",
    AI: "an A.I Resolver",
  };
  const settlementContractMap: Record<SettlementType, string> = {
    ORACLE: config.NEXT_PUBLIC_INFRA_ADDR,
    POLL: config.NEXT_PUBLIC_BEAUTY_ADDR,
    AI: config.NEXT_PUBLIC_AI_ADDR,
  };
  return (
    <>
      <RetroCard title="Rules & Resources" showClose={false}>
        <h5 className="mb-5 font-chicago text-sm">Overview</h5>
        <p className="text-xs">{desc}</p>
        <br />
        <h5 className="mb-5 font-chicago text-sm">Settlement</h5>
        <p className="text-xs">
          Settlement of this trade is completed with{" "}
          {settlementDescMap[settlement]}.
        </p>
        {oracleDescription && settlement === "ORACLE" ? (
          <p className="text-xs">
            This market concludes at: <br />
            {oracleDescription}
          </p>
        ) : null}
        <h6 className="text-xs">Settlement source: </h6>
        <Link
          className="text-xs underline"
          rel="noopener noreferrer"
          target="_blank"
          href={`https://testnet-explorer.superposition.so/address/${settlementContractMap[settlement]}`}
        >
          {settlementContractMap[settlement]}
        </Link>
      </RetroCard>
      <RetroCard title="Creator" showClose={false}>
        <h5 className="mb-5 font-chicago text-sm">Creator</h5>
        <p className="text-xs">
          This was created by{" "}
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href={`https://testnet-explorer.superposition.so/address/${creator}`}
          >
            {creator}
          </Link>
        </p>
      </RetroCard>
    </>
  );
}
