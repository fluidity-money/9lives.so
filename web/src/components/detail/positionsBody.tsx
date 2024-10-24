"use client";

import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { zeroPadValue } from "ethers";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Account } from "thirdweb/wallets";
async function fetchPositions(
  tradingAddr: PositionsProps["tradingAddr"],
  outcomeIds: PositionsProps["outcomeIds"],
  account?: Account,
) {
  if (!account) return [];

  const rawBalances = (await simulateTransaction({
    transaction: prepareContractCall({
      contract: config.contracts.lens,
      method: "balances",
      params: [
        tradingAddr,
        outcomeIds.map((outcomeId) =>
          zeroPadValue(outcomeId, 32),
        ) as `0x${string}`[],
        account.address,
      ],
    }),
  })) as bigint[];
  const balances = rawBalances.filter((_, idx) => idx % 4 === 0);

  const mintedPositions = outcomeIds
    .map((id, idx) => ({ id, balance: balances[idx].toString() }))
    .filter((item) => item.balance !== "0");

  return mintedPositions;
}

function PositionRow({ data }: { data: { id: string; balance: string } }) {
  if (!data) return <tr></tr>;

  return (
    <tr>
      <td>{data.id}</td>
      <td>{data.balance}</td>
      <td>-</td>
      <td>-</td>
    </tr>
  );
}
interface PositionsProps {
  tradingAddr: `0x${string}`;
  outcomeIds: `0x${string}`[];
}
export default function PositionsBody({
  tradingAddr,
  outcomeIds,
}: PositionsProps) {
  const account = useActiveAccount();
  const { isLoading, isError, data } = useQuery<
    { id: string; balance: string }[]
  >({
    queryKey: ["positions", tradingAddr, outcomeIds, account],
    queryFn: () => fetchPositions(tradingAddr, outcomeIds, account),
  });

  return (
    <tbody className="min-h-16">
      {isLoading ? (
        <tr className="col-span-4">
          <td>Loading...</td>
        </tr>
      ) : isError ? (
        <tr className="col-span-4">
          <td>Error occured.</td>
        </tr>
      ) : (
        data?.map((item, idx) => <PositionRow key={idx} data={item} />)
      )}
    </tbody>
  );
}
