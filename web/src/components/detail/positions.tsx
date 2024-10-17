"use client";

import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import {
  prepareContractCall,
  PreparedTransaction,
  sendBatchTransaction,
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

  const txs = outcomeIds.map(
    (outcomeId) =>
      prepareContractCall({
        contract: config.contracts.lens,
        method: "balances",
        params: [
          account.address,
          [{ campaign: campaignId, word: [outcomeId] }],
        ],
      }) as PreparedTransaction,
  );

  const waitForReceiptOptions = await sendBatchTransaction({
    transactions: txs,
    account,
  });
  console.log(waitForReceiptOptions);
  return [waitForReceiptOptions];
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

  return (
    <div className="rounded-[3px] border border-9black p-5 shadow-9card">
      <table>
        <thead>
          <tr className="font-geneva">
            <th>Position</th>
            <th>Qty</th>
            <th>Value</th>
            <th>Return</th>
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
  );
}
