import { requestAssets } from "@/providers/graphqlClient";
import { RawAsset } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function useAssets(initialData: RawAsset[]) {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => await requestAssets(),
    initialData,
  });
}
