import config from "@/config";
import { Outcome } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";

async function fetchPositions({
  tradingAddr,
  outcomes,
  address,
  isDpm,
}: {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  address?: string;
  isDpm: boolean | null;
}) {
  if (!address) return [];
  const publicClient = createPublicClient({
    chain: config.destinationChain,
    transport: http(),
  });
  if (!publicClient) throw new Error("Public client is not set");

  let balances: { amount: bigint; id: `0x${string}`; name: string }[] = [];
  if (isDpm) {
    const res = await publicClient.readContract({
      ...config.contracts.lens,
      functionName: "balancesForAllDpm",
      args: [
        [
          {
            trading: tradingAddr,
            outcomeA: outcomes[0].identifier,
            outcomeB: outcomes[1].identifier,
          },
        ],
      ],
    });
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
    const res = (await publicClient.readContract({
      ...config.contracts.lens,
      account: address as `0x${string}`,
      functionName: "balancesForAll",
      args: [[tradingAddr]],
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
        balance: formatFusdc(b.amount, 2),
        balanceRaw: b.amount,
      };
    });

  return mintedPositions;
}

export default function usePositions({
  tradingAddr,
  outcomes,
  address,
  isDpm,
}: {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  address?: string;
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
    queryKey: ["positions", tradingAddr, outcomes, address, isDpm],
    queryFn: () => fetchPositions({ tradingAddr, outcomes, address, isDpm }),
  });
}
