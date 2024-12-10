import { requestAchievments } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";
// import { useActiveAccount } from "thirdweb/react";

export default function useAchievements(props?: { walletAddress?: string }) {
  return useQuery({
    queryKey: ["achievements", props?.walletAddress],
    queryFn: async () => {
      if (!props?.walletAddress) return [];
      const res = await requestAchievments(props?.walletAddress);
      if (!res) return [];
      return res.filter((a) => a.product === "9lives");
    },
  });
}
