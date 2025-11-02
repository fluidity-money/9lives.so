import { requestUserParticipated } from "@/providers/graphqlClient";
import { ParticipatedCampaign } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function useParticipatedCampaigns(address?: string) {
  return useQuery({
    queryKey: ["participated-campaigns", address],
    queryFn: async () => {
      if (!address) return [];
      return (await requestUserParticipated(address)) as ParticipatedCampaign[];
    },
  });
}
