import { requestSeedLiquidityOfCampaign } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useSeedLiquidity(poolAddress: string) {
  return useQuery({
    queryKey: ["seedLiquidity", poolAddress],
    queryFn: async () => {
      return await requestSeedLiquidityOfCampaign(poolAddress);
    },
  });
}
