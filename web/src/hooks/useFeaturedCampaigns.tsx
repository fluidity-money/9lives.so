import { requestFeaturedCampaigns } from "@/providers/graphqlClient";
import { Campaign } from "@/types";
import { formatCampaign } from "@/utils/format/formatCampaign";
import { useQuery } from "@tanstack/react-query";

export default function useFeaturedCampaigns(initialData?: Campaign[]) {
  return useQuery({
    queryKey: ["featuredCampaigns"],
    queryFn: async () => {
      const data = await requestFeaturedCampaigns();
      return data.map((item) => formatCampaign(item));
    },
    initialData,
  });
}
