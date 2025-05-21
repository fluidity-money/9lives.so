import { requestLeaderboardCategories } from "@/providers/graphqlClient";
import { Leader } from "@/types";
import formatFusdc from "@/utils/formatFusdc";
import { useQuery } from "@tanstack/react-query";

export default function useLeaderBoardCategories() {
  return useQuery<{
    referrers: Leader[];
    volume: Leader[];
    creators: Leader[];
  }>({
    queryKey: ["leaderboard-categories"],
    queryFn: async () => {
      const res = await requestLeaderboardCategories();
      const mapper = (arr: { address: string; volume: string }[]) =>
        arr.map(
          (i, idx) =>
            ({
              wallet: i.address,
              ranking: idx + 1,
              scoring: +formatFusdc(i.volume, 2),
            }) as Leader,
        );
      const referrers = mapper(res.referrers);
      const creators = mapper(res.creators);
      const volume = mapper(res.volume);
      return { referrers, creators, volume };
    },
  });
}
