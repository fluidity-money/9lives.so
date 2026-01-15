import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";

export default function useMeowDomains(address: string) {
  return useQuery({
    queryKey: ["meowDomain", address],
    queryFn: async () => {
      const contract = config.contracts.meowDomains;
      const publicClient = createPublicClient({
        chain: config.destinationChain,
        transport: http(),
      });

      if (!publicClient) {
        console.error("Public client is not set");
        return address;
      }

      const name = await publicClient.readContract({
        ...contract,
        functionName: "defaultNames",
        args: [address as `0x${string}`],
      });

      return name ? `${name}.meow` : address;
    },
  });
}
