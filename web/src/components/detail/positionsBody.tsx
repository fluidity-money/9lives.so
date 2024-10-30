"use client";

import { Outcome } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import Button from "../themed/button";
import usePositions from "@/hooks/usePositions";
import useSharePrices from "@/hooks/useSharePrices";
import config from "@/config";

function PositionRow({
  data,
  price,
}: {
  data: { shareAddress: `0x${string}`; name: string; balance: string };
  price?: string;
}) {
  return (
    <tr>
      <td>
        <div className="flex flex-col gap-1 p-1">
          <p className="font-chicago text-xs">{data.name}</p>
          <span className="font-geneva text-[10px] uppercase text-[#808080]">
            {data.shareAddress}
          </span>
        </div>
      </td>
      <td>
        <span className="font-chicago text-xs">$ {data.balance}</span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          ${" "}
          {price
            ? (Number(data.balance) * Number(price)).toFixed(
                config.contracts.decimals.fusdc,
              )
            : ""}
        </span>
      </td>
      <td className="flex justify-end px-2">
        <Button title="Trade" intent={"no"} disabled />
      </td>
    </tr>
  );
}
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
