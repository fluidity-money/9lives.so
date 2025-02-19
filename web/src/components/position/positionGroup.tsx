"use client";

import { PositionsProps } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import usePositions from "@/hooks/usePositions";
import useSharePrices from "@/hooks/useSharePrices";
import PositionRow from "./positionRow";

export function Placeholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex min-h-36 flex-col items-center justify-center gap-1">
          <span className="font-chicago text-xs">{title}</span>
          <span className="font-geneva text-[10px] uppercase text-[#808080]">
            {subtitle}
          </span>
        </div>
      </td>
    </tr>
  );
}

export default function PositionsGroup({
  tradingAddr,
  outcomes,
  campaignName,
}: PositionsProps) {
  const account = useActiveAccount();
  const { isLoading, isError, error, data } = usePositions({
    tradingAddr,
    outcomes,
    account,
  });
  const { data: sharePrices } = useSharePrices({
    tradingAddr,
    outcomeIds: outcomes.map((o) => o.identifier),
  });

  if (isLoading) return <Placeholder title="Loading..." />;
  if (isError)
    return <Placeholder title="Whoops, error!" subtitle={error.message} />;
  if (data?.length === 0)
    return (
      <Placeholder
        title="Nothing yet."
        subtitle="Start Growing Your Portfolio."
      />
    );

  return (
    <>
      {data?.map((item, idx) => (
        <PositionRow
          key={idx}
          data={{ ...item, campaignName }}
          price={sharePrices?.find((o) => o.id === item.id)?.price}
        />
      ))}
    </>
  );
}
