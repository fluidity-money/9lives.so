import config from "@/config";
import { thirdwebClient } from "@/config/app";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { formatUnits } from "ethers";
import { useQuery } from "@tanstack/react-query";

export default function useSharePrices({
  tradingAddr,
  outcomeIds,
}: {
  tradingAddr: string;
  outcomeIds: `0x${string}`[];
}) {
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: thirdwebClient,
    chain: config.chains.superpositionTestnet,
  });

  const promises = outcomeIds.map((outcomeId) =>
    simulateTransaction({
      transaction: prepareContractCall({
        contract: tradingContract,
        method: "priceF3C364BC",
        params: [outcomeId],
      }),
    }),
  );

  return useQuery<{ id: `0x${string}`; price: string }[]>({
    queryKey: ["sharePrices", tradingAddr],
    queryFn: async () => {
      const res = await Promise.all<bigint>(promises);
      return res.map((price, idx) => ({
        id: outcomeIds[idx],
        price: price ? formatUnits(price, config.contracts.decimals.fusdc) : "",
      }));
    },
  });
}
