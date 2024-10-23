import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { formatUnits } from "ethers";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useSharePrices({
  tradingAddr,
  outcomeIds,
}: {
  tradingAddr: string;
  outcomeIds: `0x${string}`[];
}) {
  const tradingContract = useMemo(
    () =>
      getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.chains.superpositionTestnet,
      }),
    [tradingAddr],
  );

  const promises = useMemo(
    () =>
      outcomeIds.map((outcomeId) =>
        simulateTransaction({
          transaction: prepareContractCall({
            contract: tradingContract,
            method: "priceF3C364BC",
            params: [outcomeId],
          }),
        }),
      ),
    [outcomeIds, tradingContract],
  );

  return useQuery<{ id: `0x${string}`; price: string }[]>({
    queryKey: ["sharePrices", tradingAddr, promises],
    queryFn: async () => {
      const res = await Promise.all<bigint>(promises);
      return res.map((price, idx) => ({
        id: outcomeIds[idx],
        price: price ? formatUnits(price, config.contracts.decimals.fusdc) : "",
      }));
    },
  });
}
