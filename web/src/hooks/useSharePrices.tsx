import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { useQuery } from "@tanstack/react-query";
import formatFusdc from "@/utils/formatFusdc";
export default function useSharePrices({
  tradingAddr,
  outcomeIds,
}: {
  tradingAddr: string;
  outcomeIds: `0x${string}`[];
}) {
  return useQuery<{ id: `0x${string}`; price: string }[]>({
    queryKey: ["sharePrices", tradingAddr, outcomeIds],
    queryFn: async () => {
      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.chains.currentChain,
      });
      const res = await Promise.all<bigint>(
        outcomeIds.map((outcomeId) =>
          simulateTransaction({
            transaction: prepareContractCall({
              contract: tradingContract,
              method: "priceA827ED27",
              params: [outcomeId],
            }),
          }),
        ),
      );
      return res.map((price, idx) => ({
        id: outcomeIds[idx],
        price: price ? formatFusdc(Number(price), 2) : "0.00",
      }));
    },
  });
}
