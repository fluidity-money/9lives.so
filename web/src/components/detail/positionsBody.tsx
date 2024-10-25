"use client";

import config from "@/config";
import { Outcome } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { formatUnits, zeroPadValue } from "ethers";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Account } from "thirdweb/wallets";
import Button from "../themed/button";
async function fetchPositions(
  tradingAddr: PositionsProps["tradingAddr"],
  outcomes: Outcome[],
  account?: Account,
) {
  if (!account) return [];
  const concatIds = outcomes.reduce((acc, v) => {
    acc = acc + v.identifier.slice(2);
    return acc;
  }, "");
  const word = zeroPadValue(`0x${concatIds}`, 32);
  const balances = (await simulateTransaction({
    transaction: prepareContractCall({
      contract: config.contracts.lens,
      method: "balances",
      params: [tradingAddr, [word] as `0x${string}`[], account.address],
    }),
  })) as bigint[];

  const mintedPositions = outcomes
    .map((outcome, idx) => ({
      id: outcome.identifier,
      name: outcome.name,
      balance: formatUnits(balances[idx], config.contracts.decimals.fusdc),
    }))
    .filter((item) => item.balance !== "0.0");

  return mintedPositions;
}

function PositionRow({
  data,
}: {
  data: { id: string; name: string; balance: string };
}) {
  return (
    <tr>
      <td>
        <div className="flex flex-col gap-1 p-1">
          <p className="font-chicago text-xs">{data.name}</p>
          <span className="font-geneva text-[10px] uppercase text-[#808080]">
            {data.id}
          </span>
        </div>
      </td>
      <td>
        <span className="font-chicago text-xs">$ {data.balance}</span>
      </td>
      <td className="flex justify-end px-2">
        <Button title="Sell" intent={"no"} />
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
        <td colSpan={3}>
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
  const { isLoading, isError, error, data } = useQuery<
    { id: string; name: string; balance: string }[]
  >({
    queryKey: ["positions", tradingAddr, outcomes, account],
    queryFn: () => fetchPositions(tradingAddr, outcomes, account),
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
      {data?.map((item, idx) => <PositionRow key={idx} data={item} />)}
    </tbody>
  );
}
