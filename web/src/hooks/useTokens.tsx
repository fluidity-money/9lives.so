import config from "@/config";
import { Token } from "@/types";
import { useQuery } from "@tanstack/react-query";

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
      const items = data.tokens[fromChain];
      if (fromChain === config.chains.superposition.id) {
        return [
          items.find(
            (t) =>
              t.address.toLowerCase() ===
              config.NEXT_PUBLIC_FUSDC_ADDR.toLowerCase(),
          )!,
        ];
      }
      return items;
    },
    placeholderData: (previousData) => previousData,
  });
}
