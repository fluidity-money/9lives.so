import { requestAchievmentCount } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useAchievmentCount(address?: string) {
  return useQuery({
    queryKey: ["achievmentCount", address],
    queryFn: async () => {
      if (!address) return 0;
      const achvs = await requestAchievmentCount(address);
      return achvs.length;
    },
  });
}
