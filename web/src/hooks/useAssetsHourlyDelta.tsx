import { requestAssetsHourlyDelta } from "@/providers/graphqlClient";
import { AssetMetadata } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function useAssetsHourlyDelta() {
  return useQuery<(AssetMetadata | null)[], Error, AssetMetadata[]>({
    queryKey: ["assetsHourlyDelta"],
    queryFn: async () => {
      return await requestAssetsHourlyDelta();
    },
    select(data) {
      return data.filter((i) => !!i);
    },
  });
}
