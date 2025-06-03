import { requestFeaturedCampaigns } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useFeaturedCampaigns() {
  return useQuery({
    queryKey: ["featured-campaigns"],
    queryFn: async () => {
      const data = await requestFeaturedCampaigns({});
      return data;
    },
  });
}
