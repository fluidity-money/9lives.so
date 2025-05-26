import { requestChangelog } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useChangelog() {
  return useQuery({
    queryKey: ["changelog"],
    queryFn: async () => await requestChangelog(),
  });
}
