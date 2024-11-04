import { requestAchievments } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";
// import { useActiveAccount } from "thirdweb/react";

export default function useAchievements(props?: { walletAddress?: string }) {
  return useQuery({
    queryKey: ["achievements", props?.walletAddress],
    queryFn: async () => {
      const res = await requestAchievments(props?.walletAddress);
      return res.achievements;
    },
  });
}
