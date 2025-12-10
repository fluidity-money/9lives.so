import { request9LivesPoints } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      return await request9LivesPoints();
    },
  });
}
