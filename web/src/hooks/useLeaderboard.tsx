import { requestLeaderboard } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await requestLeaderboard();
      return res.leaderboards;
    },
  });
}
