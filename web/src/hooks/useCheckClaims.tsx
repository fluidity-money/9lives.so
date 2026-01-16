import config from "@/config";
import { useSimulateContract } from "wagmi";

export default function useCheckClaims(
  poolAddresses: string[],
  walletAddress?: string,
) {
  return useSimulateContract({
    ...config.contracts.claimantHelper,
    account: walletAddress as `0x${string}`,
    functionName: "claim",
    args: [poolAddresses as `0x${string}`[]],
    chainId: config.destinationChain.id,
    query: {
      enabled: Boolean(walletAddress),
    },
  });
}
