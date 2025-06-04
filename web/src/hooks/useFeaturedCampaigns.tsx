import { requestFeaturedCampaigns } from "@/providers/graphqlClient";
import { Campaign, CampaignDto } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function useFeaturedCampaigns(initialData?: Campaign[]) {
  return useQuery({
    queryKey: ["featuredCampaigns"],
    queryFn: async () => {
      const data = await requestFeaturedCampaigns();
      return data.map((item) => new CampaignDto(item));
    },
    initialData,
  });
}
