import config from "@/config";
import { Outcome } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { Account } from "thirdweb/wallets";

async function fetchPositions({
  tradingAddr,
  outcomes,
  account,
  isDpm,
}: {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  account?: Account;
  isDpm: boolean | null;
}) {
  if (!account) return [];
  const dpmTx = prepareContractCall({
    contract: config.contracts.lens,
    method: "balancesForAllDpm",
    params: [
      [
        {
          trading: tradingAddr,
          outcomeA: outcomes[0].identifier,
          outcomeB: outcomes[1].identifier,
        },
      ],
    ],
  });
  const ammTx = prepareContractCall({
    contract: config.contracts.lens,
    method: "balancesForAll",
    params: [[tradingAddr]],
  });
  let balances: { amount: string; id: `0x${string}`; name: string }[] = [];
  if (isDpm) {
    const res = (await simulateTransaction({
      transaction: dpmTx,
      account,
    })) as {
      trading: string;
      outcomeA: string;
      nameA: string;
      outcomeB: string;
      nameB: string;
    }[];
    balances = [
      {
        id: outcomes[0].identifier,
        amount: res[0].outcomeA,
        name: res[0].nameA,
      },
      {
        id: outcomes[1].identifier,
        amount: res[0].outcomeB,
        name: res[0].nameB,
      },
    ];
  } else {
    const res = (await simulateTransaction({
      transaction: ammTx,
      account,
    })) as typeof balances;
    balances = res;
  }
  const mintedPositions = balances
    .filter((b) => Number(b.amount) > 0)
    .map((b) => {
      const outcome = outcomes.find((o) => o.identifier === b.id);
      return {
        id: b.id,
        shareAddress: outcome?.share.address ?? "0x",
        name: outcome?.name ?? b.name,
        balance: formatFusdc(Number(b.amount), 2),
        balanceRaw: BigInt(b.amount),
      };
    });

  return mintedPositions;
}

export default function usePositions({
  tradingAddr,
  outcomes,
  account,
  isDpm,
}: {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  account?: Account;
  isDpm: boolean | null;
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
    queryKey: ["positions", tradingAddr, outcomes, account, isDpm],
    queryFn: () => fetchPositions({ tradingAddr, outcomes, account, isDpm }),
  });
}
