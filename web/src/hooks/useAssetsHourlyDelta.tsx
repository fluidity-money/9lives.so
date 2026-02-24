import { requestAssetsHourlyDelta } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useAssetsHourlyDelta() {
  return useQuery({
    queryKey: ["assetsHourlyDelta"],
    queryFn: async () => {
      return await requestAssetsHourlyDelta();
    },
  });
}
