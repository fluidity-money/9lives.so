import { requestTimebasedCampaigns } from "@/providers/graphqlClient";
import { formatCampaign } from "@/utils/format/formatCampaign";
import { useQuery } from "@tanstack/react-query";

export default function useTimebasedCampaigns(
  categories: string[],
  tokens: string[],
) {
  return useQuery({
    queryKey: ["timebasedCampaigns", categories, tokens],
    queryFn: async () => {
      const res = await requestTimebasedCampaigns(categories, tokens);
      const data = res.filter((i) => !!i).map((i) => formatCampaign(i));
      return data;
    },
  });
}
