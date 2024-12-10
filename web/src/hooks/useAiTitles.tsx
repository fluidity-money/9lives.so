import { requestGetAITitles } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useAiTitles(enabled: boolean) {
  return useQuery<string[]>({
    queryKey: ["aiTitles"],
    queryFn: async () => {
      const res = await requestGetAITitles;
      if (!res) return [];
      return res;
    },
    enabled,
  });
}
