import { requestUserParticipated } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useParticipatedCampaigns(address?: string) {
  return useQuery({
    queryKey: ["participated-campaigns", address],
    queryFn: async () => {
      if (!address) return [];
      return await requestUserParticipated(address);
    },
  });
}
