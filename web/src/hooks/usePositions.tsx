import config from "@/config";
import { Outcome } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { formatUnits, zeroPadValue } from "ethers";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { Account } from "thirdweb/wallets";
async function fetchPositions(
  tradingAddr: `0x${string}`,
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

export default function usePositions({
  tradingAddr,
  outcomes,
  account,
}: {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  account?: Account;
}) {
  return useQuery<{ id: string; name: string; balance: string }[]>({
    queryKey: ["positions", tradingAddr, outcomes, account],
    queryFn: () => fetchPositions(tradingAddr, outcomes, account),
  });
}
