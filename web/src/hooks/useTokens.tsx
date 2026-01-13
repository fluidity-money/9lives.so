import config from "@/config";
import { Token } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { zeroAddress } from "viem";
const allowedSymbols = ["usdc", "usdt", "usdc.e", "usdt0", "arb", "op"];
const isAllowedSymbol = (t: Token) =>
  allowedSymbols.reduce((acc, v) => {
    if (t.symbol.toLowerCase() === v) return true;
    return acc;
  }, false);
export default function useTokens(fromChain: number) {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokens", fromChain],
    queryFn: async () => {
      const url = `https://li.quest/v1/tokens?chains=${fromChain}`;
      const options = {
        method: "GET",
        headers: { accept: "application/json" },
      };
      const res = await fetch(url, options);
      const data = (await res.json()) as {
        tokens: {
          [fromChain]: Token[];
        };
      };
      const items = data.tokens?.[fromChain];
      if (!items) return [];
      // only display usdc if selected chain is SPN
      if (fromChain === config.chains.superposition.id) {
        return items.filter(
          (t) =>
            t.address.toLowerCase() ===
            config.NEXT_PUBLIC_FUSDC_ADDR.toLowerCase(),
        );
      }
      return items.filter(
        (t) => isAllowedSymbol(t) || t.address === zeroAddress,
      );
    },
    placeholderData: (previousData) => previousData,
  });
}
