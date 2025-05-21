import { requestReferrersForAddress } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useReferrerCode(address?: string) {
  return useQuery({
    queryKey: ["referrerCode", address],
    queryFn: async () => {
      if (!address) return null;
      const codes = await requestReferrersForAddress(address);
      return codes[0];
    },
  });
}
