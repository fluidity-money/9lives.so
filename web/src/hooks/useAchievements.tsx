import { requestAchievments } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";

export default function useAchievements() {
  const account = useActiveAccount();
  // get only achievments user owns if wallet connected
  const { data: ownedAchievments, isSuccess: shouldMergeUserOwned } = useQuery({
    queryKey: ["achievements", account?.address],
    queryFn: async () => {
      const res = await requestAchievments(account?.address);
      if (!res) return [];
      return res.filter((a) => a.product === "9lives");
    },
    enabled: !!account?.address,
  });
  return useQuery({
    queryKey: ["achievements", shouldMergeUserOwned],
    queryFn: async () => {
      const res = await requestAchievments();
      return res
        .filter((a) => a.product === "9lives")
        .map((a) => ({
          ...a,
          isOwned: ownedAchievments
            ? ownedAchievments?.findIndex((oa) => oa.id === a.id) !== -1
            : false,
        }));
    },
  });
}
