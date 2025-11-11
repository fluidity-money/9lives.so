import config from "@/config";
import tradingAbi from "@/config/abi/trading";
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
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  enabled: boolean;
  isPriceAbove: boolean;
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
        return [
          {
            dppmFusdc: BigInt(0),
            ninetailsLoserFusd: BigInt(0),
            ninetailsWinnerFusdc: BigInt(0),
          },
          {
            dppmFusdc: BigInt(0),
            ninetailsLoserFusd: BigInt(0),
            ninetailsWinnerFusdc: BigInt(0),
          },
        ];

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

      return await simulateTransaction({
        transaction: estimateTx,
      });
    },
    select: (data) => {
      if (isPriceAbove) {
        return [
          {
            dppmFusdc: 0,
            ninetailsWinnerFusdc: 0,
            ninetailsLoserFusd: Number(
              formatFusdc(data[0].ninetailsLoserFusd, 2),
            ),
          }, // Down outcome = Looser
          {
            dppmFusdc: Number(formatFusdc(data[1].dppmFusdc, 2)),
            ninetailsWinnerFusdc: Number(
              formatFusdc(data[1].ninetailsWinnerFusdc, 2),
            ),
            ninetailsLoserFusd: 0,
          }, //Up outcome = Winner
        ];
      } else {
        return [
          {
            dppmFusdc: Number(formatFusdc(data[0].dppmFusdc, 2)),
            ninetailsWinnerFusdc: Number(
              formatFusdc(data[0].ninetailsWinnerFusdc, 2),
            ),
            ninetailsLoserFusd: 0,
          }, //Down outcome = Winner
          {
            dppmFusdc: 0,
            ninetailsWinnerFusdc: 0,
            ninetailsLoserFusd: Number(
              formatFusdc(data[1].ninetailsLoserFusd, 2),
            ),
          }, // Up outcome = Looser
        ];
      }
    },
    initialData: [
      {
        dppmFusdc: BigInt(0),
        ninetailsLoserFusd: BigInt(0),
        ninetailsWinnerFusdc: BigInt(0),
      },
      {
        dppmFusdc: BigInt(0),
        ninetailsLoserFusd: BigInt(0),
        ninetailsWinnerFusdc: BigInt(0),
      },
    ],
    enabled,
  });
}
