import { requestUserLiquidity } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useUserLiquidity({
  address,
  tradingAddr,
}: {
  address?: string;
  tradingAddr?: string;
}) {
  return useQuery({
    queryKey: ["userLiquidity", address, tradingAddr],
    queryFn: async () => {
      if (!address) return "0";
      return await requestUserLiquidity({ address, tradingAddr });
    },
  });
}
