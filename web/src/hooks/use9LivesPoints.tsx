import { request9LivesPoints } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function use9LivesPoints({
  address,
  enabled = true,
}: {
  enabled?: boolean;
  address?: string;
}) {
  return useQuery({
    queryKey: ["ninelives-points", address],
    queryFn: async () => {
      return await request9LivesPoints(address);
    },
    select(data) {
      return data.map((i) => {
        if (!i) return { wallet: "0x", amount: 0 };
        return i;
      });
    },
    enabled,
  });
}
