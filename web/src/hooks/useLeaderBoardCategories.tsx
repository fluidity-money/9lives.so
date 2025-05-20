import { requestLeaderboardCategories } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useLeaderBoardCategories() {
  return useQuery({
    queryKey: ["leaderboard-categories"],
    queryFn: async () => {
      const res = await requestLeaderboardCategories();
      return res;
    },
  });
}
