import { requestWeeklyVolume } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useWeeklyVolume(poolAddress: string) {
  return useQuery({
    queryKey: ["weeklyVolume", poolAddress],
    queryFn: async () => {
      return await requestWeeklyVolume(poolAddress);
    },
  });
}
