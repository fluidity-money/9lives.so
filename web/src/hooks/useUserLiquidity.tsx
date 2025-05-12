import { requestUserLiquidity } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useUserLiquidity(
  address: string,
  tradingAddr?: string,
) {
  return useQuery({
    queryKey: ["userLiquidity", address, tradingAddr],
    queryFn: async () => await requestUserLiquidity(address, tradingAddr),
  });
}
