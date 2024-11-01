import { requestAchievments } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";

export default function useAchievements() {
  const account = useActiveAccount();
  return useQuery({
    queryKey: ["achievements", account?.address],
    queryFn: async () => {
      if (!account?.address) return [];
      const res = await requestAchievments(account?.address);
      return res.achievements;
    },
  });
}
