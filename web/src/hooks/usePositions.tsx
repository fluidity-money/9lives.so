import config from "@/config";
import { Outcome } from "@/types";
import formatFusdc from "@/utils/formatFusdc";
import { useQuery } from "@tanstack/react-query";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { Account } from "thirdweb/wallets";

async function fetchPositions(
  tradingAddr: `0x${string}`,
  outcomes: Outcome[],
  account?: Account,
) {
  if (!account) return [];
  const balances = (
    (await simulateTransaction({
      transaction: prepareContractCall({
        contract: config.contracts.lens,
        method: "balancesForAll",
        params: [[tradingAddr]],
      }),
    })) as { amount: string; id: `0x${string}`; name: string }[]
  ).filter((i) => BigInt(i.amount) > BigInt(0));

  const mintedPositions = balances.map((b) => ({
    id: b.id,
    shareAddress:
      outcomes.find((o) => o.identifier === b.id)?.share.address ?? "0x",
    name: b.name,
    balance: formatFusdc(Number(b.amount), 2),
    balanceRaw: BigInt(b.amount),
  }));

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
      balanceRaw: bigint;
    }[]
  >({
    queryKey: ["positions", tradingAddr, outcomes, account],
    queryFn: () => fetchPositions(tradingAddr, outcomes, account),
  });
}
