import config from "@/config";
import { Outcome } from "@/types";
import formatFusdc from "@/utils/formatFusdc";
import { useQuery } from "@tanstack/react-query";
import { zeroPadValue } from "ethers";
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
      shareAddress: outcome.share.address,
      name: outcome.name,
      balance: formatFusdc(Number(balances[idx]), 2),
    }))
    .filter((item) => item.balance !== "0.00");

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
  return useQuery<
    {
      id: `0x${string}`;
      shareAddress: `0x${string}`;
      name: string;
      balance: string;
    }[]
  >({
    queryKey: ["positions", tradingAddr, outcomes, account],
    queryFn: () => fetchPositions(tradingAddr, outcomes, account),
  });
}
