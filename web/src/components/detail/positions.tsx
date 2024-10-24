"use client";

import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { zeroPadValue } from "ethers";
import { Suspense } from "react";
import {
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Account } from "thirdweb/wallets";

interface PositionsProps {
  tradingAddr: `0x${string}`;
  outcomeIds: `0x${string}`[];
}
async function fetchPositions(
  tradingAddr: PositionsProps["tradingAddr"],
  outcomeIds: PositionsProps["outcomeIds"],
  account?: Account,
) {
  if (!account) return [];

  const rawBalances = await simulateTransaction({
    transaction: prepareContractCall({
      contract: config.contracts.lens,
      method: "balances",
      params: [
        tradingAddr,
        outcomeIds.map(outcomeId => zeroPadValue(outcomeId, 32)) as `0x${string}`[],
        account.address
      ],
    }),
  }) as bigint[];
  const balances = rawBalances.filter((_, idx) => idx % 4 === 0);

  const mintedPositions = outcomeIds.map((id, idx) => ({ id, balance: balances[idx].toString() })).filter(item => item.balance !== '0')

  return mintedPositions
}

function PositionRow({ data }: { data: { id: string, balance: string } }) {

  if (!data) return <tr></tr>

  return (
    <tr>
      <td>{data.id}</td>
      <td>{data.balance}</td>
      <td>-</td>
      <td>-</td>
    </tr>
  );
}
export default function Positions({ tradingAddr, outcomeIds }: PositionsProps) {
  const account = useActiveAccount();
  const { isLoading, isError, data } = useQuery<{ id: string, balance: string }[]>({
    queryKey: ["positions", tradingAddr, outcomeIds, account],
    queryFn: () => fetchPositions(tradingAddr, outcomeIds, account),
  });
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = ["Position", "Qty", "Value", "Return"];

  return (
    <div>
      <div className="inline rounded-t-md border-x border-t border-black bg-9layer px-2 py-1 font-chicago text-xs">
        My Campaign Positions
      </div>
      <div className="rounded-[3px] rounded-tl-none border border-9black p-5 shadow-9card">
        <table className="w-full">
          <thead>
            <tr className="font-geneva">
              {tablesHeaders.map((key) => (
                <th className={tableHeaderClasses} key={key}>
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="min-h-16">
            {isLoading ? (
              <tr className="col-span-4">Loading...</tr>
            ) : isError ? (
              <tr className="col-span-4">Error occured.</tr>
            ) : (
              data?.map((item, idx) => <PositionRow key={idx} data={item} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
