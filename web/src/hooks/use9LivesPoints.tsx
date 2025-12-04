import { request9LivesPoints } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";

export default function use9LivesPoints() {
  const account = useActiveAccount();

  return useQuery({
    queryKey: ["ninelives-points", account?.address],
    queryFn: async () => {
      if (!account?.address) return 0;
      const res = await request9LivesPoints(account.address);
      return res.amount;
    },
  });
}
