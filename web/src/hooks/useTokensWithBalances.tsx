import config from "@/config";
import { Token } from "@/types";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, erc20Abi, http, zeroAddress } from "viem";

export default function useTokensWithBalances(
  chainId: number,
  tokens?: Token[],
) {
  const account = useAppKitAccount();

  return useQuery<(Token & { balance: bigint })[]>({
    queryKey: ["tokensWithBalances", account?.address, tokens],
    queryFn: async () => {
      if (!tokens) return [];
      if (!account.address)
        return tokens.map((t) => ({ ...t, balance: BigInt(0) }));
      const publicClient = createPublicClient({
        chain: Object.values(config.chains).find((c) => c.id === chainId),
        transport: http(),
      });
      if (!publicClient) {
        console.error("Public client is not set");
        return tokens.map((t) => ({ ...t, balance: BigInt(0) }));
      }
      const balances = await Promise.all(
        tokens.map(async (token) => {
          if (
            token.address === zeroAddress ||
            token.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          ) {
            return {
              ...token,
              balance: await publicClient.getBalance({
                address: account.address as `0x${string}`,
              }),
            };
          } else {
            const balance = await publicClient.readContract({
              address: token.address as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [account.address as `0x${string}`],
            });
            return {
              ...token,
              balance,
            };
          }
        }),
      );

      return balances;
    },
    enabled: !!account?.address && !!tokens,
  });
}
