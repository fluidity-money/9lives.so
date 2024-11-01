"use client";

import { Outcome } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import usePositions from "@/hooks/usePositions";
import useSharePrices from "@/hooks/useSharePrices";
import PositionRow from "./positionRow";

const bodyStyles = "min-h-24 bg-9gray";
function Placeholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <tbody className={bodyStyles}>
      <tr>
        <td colSpan={4}>
          <div className="flex min-h-36 flex-col items-center justify-center gap-1">
            <span className="font-chicago text-xs">{title}</span>
            <span className="font-geneva text-[10px] uppercase text-[#808080]">
              {subtitle}
            </span>
          </div>
        </td>
      </tr>
    </tbody>
  );
}
interface PositionsProps {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
}
export default function PositionsBody({
  tradingAddr,
  outcomes,
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
    <tbody className={bodyStyles}>
      {data?.map((item, idx) => (
        <PositionRow
          key={idx}
          data={item}
          price={sharePrices?.find((o) => o.id === item.id)?.price}
        />
      ))}
    </tbody>
  );
}
