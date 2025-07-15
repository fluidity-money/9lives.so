import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";

export default function useTokensWithBalances(chain: number) {
  const account = useActiveAccount();

  return useQuery({
    queryKey: ["tokensWithBalances", account?.address, chain],
    queryFn: async () => {
      if (!account?.address) return [];
      const response = await fetch(
        `https://insight.thirdweb.com/v1/tokens?chain_id=${chain}&include_native=true&include_spam=false&limit=50&metadata=true&owner_address=${account.address}`,
        {
          headers: {
            "x-client-id": config.thirdweb.client.clientId,
          },
        },
      );
      const { data } = (await response.json()) as {
        data: { balance: string; token_address: string }[];
      };
      return data ?? [];
    },
  });
}
