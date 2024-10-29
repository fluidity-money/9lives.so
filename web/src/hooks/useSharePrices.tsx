import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { formatUnits } from "ethers";
import { useQuery } from "@tanstack/react-query";
import { arbitrum } from "thirdweb/chains";
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
        chain: arbitrum,
      });
      const res = await Promise.all<bigint>(
        outcomeIds.map((outcomeId) =>
          simulateTransaction({
            transaction: prepareContractCall({
              contract: tradingContract,
              method: "priceF3C364BC",
              params: [outcomeId],
            }),
          }),
        ),
      );
      return res.map((price, idx) => ({
        id: outcomeIds[idx],
        price: price ? formatUnits(price, config.contracts.decimals.fusdc) : "",
      }));
    },
  });
}
