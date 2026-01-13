import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

export default function useMeowDomains(address: string) {
  const publicClient = usePublicClient()
  
  return useQuery({
    queryKey: ["meowDomain", address],
    queryFn: async () => {
      const contract = config.contracts.meowDomains;

      if (!publicClient) {
        console.error("Public client is not set")
        return address
      }

      const name = await publicClient.readContract({
        ...contract,
        functionName: "defaultNames",
        args: [address as `0x${string}`]
      })

      return name ? `${name}.meow` : address;
    },
  });
}
