import { requestUserLPs } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useUserLPs(address?: string) {
  return useQuery({
    queryKey: ["user-lps", address],
    queryFn: async () => {
      if (!address) return [];
      return await requestUserLPs(address);
    },
  });
}
