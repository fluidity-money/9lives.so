import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { Outcome } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
export default function useDppmShareEstimationAll({
  tradingAddr,
  account,
  enabled,
  isPriceAbove,
  outcomes,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  enabled: boolean;
  isPriceAbove: boolean;
  outcomes: Outcome[];
}) {
  return useQuery({
    queryKey: [
      "dppmShareEstimationForAll",
      tradingAddr,
      account?.address,
      isPriceAbove,
    ],
    queryFn: async () => {
      if (!account?.address)
        return outcomes.map((o) => ({
          identifier: o.identifier,
          dppmFusdc: BigInt(0),
          ninetailsLoserFusd: BigInt(0),
          ninetailsWinnerFusdc: BigInt(0),
        }));

      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.destinationChain,
      });

      const estimateTx = prepareContractCall({
        contract: tradingContract,
        method: "dppmSimulatePayoffForAddressAll",
        params: [account.address],
      });

      return (await simulateTransaction({
        transaction: estimateTx,
      })) as {
        identifier: string;
        dppmFusdc: bigint;
        ninetailsLoserFusd: bigint;
        ninetailsWinnerFusdc: bigint;
      }[];
    },
    select: (data) => {
      const down = data.find((i) => i.identifier === outcomes[0].identifier);
      const up = data.find((i) => i.identifier === outcomes[1].identifier);

      if (!down || !up) throw new Error("Outcomes doesnt match");

      if (isPriceAbove) {
        return [
          {
            identifier: down.identifier,
            dppmFusdc: 0,
            ninetailsWinnerFusdc: 0,
            ninetailsLoserFusd: Number(formatFusdc(down.ninetailsLoserFusd, 2)),
          }, // Down outcome = Looser
          {
            identifier: up.identifier,
            dppmFusdc: Number(formatFusdc(up.dppmFusdc, 2)),
            ninetailsWinnerFusdc: Number(
              formatFusdc(up.ninetailsWinnerFusdc, 2),
            ),
            ninetailsLoserFusd: 0,
          }, //Up outcome = Winner
        ];
      } else {
        return [
          {
            identifier: down.identifier,
            dppmFusdc: Number(formatFusdc(down.dppmFusdc, 2)),
            ninetailsWinnerFusdc: Number(
              formatFusdc(down.ninetailsWinnerFusdc, 2),
            ),
            ninetailsLoserFusd: 0,
          }, //Down outcome = Winner
          {
            identifier: up.identifier,
            dppmFusdc: 0,
            ninetailsWinnerFusdc: 0,
            ninetailsLoserFusd: Number(formatFusdc(up.ninetailsLoserFusd, 2)),
          }, // Up outcome = Looser
        ];
      }
    },
    initialData: outcomes.map((o) => ({
      identifier: o.identifier,
      dppmFusdc: BigInt(0),
      ninetailsLoserFusd: BigInt(0),
      ninetailsWinnerFusdc: BigInt(0),
    })),
    enabled,
  });
}
