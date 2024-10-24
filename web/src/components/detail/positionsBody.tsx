"use client";

import config from "@/config";
import { Outcome } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { zeroPadValue } from "ethers";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Account } from "thirdweb/wallets";
async function fetchPositions(
  tradingAddr: PositionsProps["tradingAddr"],
  outcomes: Outcome[],
  account?: Account,
) {
  if (!account) return [];

  const rawBalances = (await simulateTransaction({
    transaction: prepareContractCall({
      contract: config.contracts.lens,
      method: "balances",
      params: [
        tradingAddr,
        outcomes.map((outcome) =>
          zeroPadValue(outcome.identifier, 32),
        ) as `0x${string}`[],
        account.address,
      ],
    }),
  })) as bigint[];
  const balances = rawBalances.filter((_, idx) => idx % 4 === 0);

  const mintedPositions = outcomes
    .map((outcome, idx) => ({ id: outcome.identifier, name: outcome.name, balance: balances[idx].toString() }))
    .filter((item) => item.balance !== "0");

  return mintedPositions;
}

function PositionRow({ data }: { data: { id: string; name: string, balance: string } }) {
  if (!data) return <tr></tr>;

  return (
    <tr>
      <td>{data.name}</td>
      <td>{data.id}</td>
      <td>{data.balance}</td>
      <td>-</td>
    </tr>
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
  const outcomeIds = outcomes.map(
    (outcome) => outcome.identifier,
  ) as `0x${string}`[];
  const { isLoading, isError, data } = useQuery<
    { id: string; name: string, balance: string }[]
  >({
    queryKey: ["positions", tradingAddr, outcomes, account],
    queryFn: () => fetchPositions(tradingAddr, outcomes, account),
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
