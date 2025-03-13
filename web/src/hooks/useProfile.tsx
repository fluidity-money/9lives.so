import { requestProfile } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useProfile(address?: string) {
  return useQuery({
    queryKey: ["profile", address],
    queryFn: async () => {
      if (!address) return null;
      return await requestProfile(address);
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
