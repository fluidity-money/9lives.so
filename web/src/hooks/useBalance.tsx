import config from "@/config";
import ERC20Abi from "@/config/abi/erc20";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";

export default function useBalance(
  address?: string,
  erc20Addr: string = config.contracts.fusdc.address,
) {
  return useQuery<bigint>({
    queryKey: ["balance", address, erc20Addr],
    queryFn: async () => {
      const publicClient = createPublicClient({
        chain: config.destinationChain,
        transport: http(),
      });
      if (!address) return BigInt(0);
      if (!publicClient) {
        console.error("Public client is not set");
        return BigInt(0);
      }

      return await publicClient.readContract({
        address: erc20Addr as `0x${string}`,
        abi: ERC20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
    },
    enabled: Boolean(address),
    initialData: BigInt(0),
  });
}
