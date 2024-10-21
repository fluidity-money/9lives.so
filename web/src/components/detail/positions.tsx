"use client";

import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import {
  prepareContractCall,
  PreparedTransaction,
  simulateTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Account } from "thirdweb/wallets";

interface PositionsProps {
  campaignId: `0x${string}`;
  outcomeIds: `0x${string}`[];
}
async function fetchPositions(
  campaignId: PositionsProps["campaignId"],
  outcomeIds: PositionsProps["outcomeIds"],
  account?: Account,
) {
  if (!account) return [];

  const txSims = outcomeIds.map((outcomeId) =>
    simulateTransaction({
      transaction: prepareContractCall({
        contract: config.contracts.lens,
        method: "balances",
        params: [
          account.address,
          [{ campaign: campaignId, word: [outcomeId] }],
        ],
      }) as PreparedTransaction,
    }),
  );
  const res = await Promise.all(txSims);

  return res;
}
function PositionRow({ data }: { data: any }) {
  return (
    <tr>
      <td>0x123</td>
      <td>100</td>
      <td>For</td>
      <td>0.08</td>
    </tr>
  );
}
export default function Positions({ campaignId, outcomeIds }: PositionsProps) {
  const account = useActiveAccount();
  const { isLoading, isError, data } = useQuery({
    queryKey: ["positions", campaignId, outcomeIds, account],
    queryFn: () => fetchPositions(campaignId, outcomeIds, account),
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
