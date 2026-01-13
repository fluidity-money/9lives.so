import config from "@/config";
import ERC20Abi from "@/config/abi/erc20";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

export default function useBalance(
  address?: string,
  erc20Addr: string = config.contracts.fusdc.address,
) {
  const publicClient = usePublicClient()
  return useQuery<bigint>({
    queryKey: ["balance", address, erc20Addr],
    queryFn: async () => {
      if (!address) return BigInt(0);
      if (!publicClient) {
        console.error("Public client is not set")
        return BigInt(0)
      }

      return await publicClient.readContract({
        address: erc20Addr as `0x${string}`,
        abi: ERC20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`]
      })
    },
    initialData: BigInt(0),
  });
}
