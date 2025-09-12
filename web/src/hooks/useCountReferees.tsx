import { requestCountReferees } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useCountReferees(address?: string) {
  return useQuery({
    queryKey: ["refereeCount", address],
    queryFn: async () => {
      if (!address) return 0;
      return await requestCountReferees(address);
    },
  });
}
