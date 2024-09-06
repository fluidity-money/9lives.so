import { useQuery } from "@tanstack/react-query";

const featureFlags = ["graph mock data"] as const;
type FlagDictionary = {
  [key in (typeof featureFlags)[number]]: boolean;
};
export default function useFeatureFlag(key: (typeof featureFlags)[number]) {
  const { data: flags, isSuccess } = useQuery<FlagDictionary>({
    queryKey: ["features"],
  });

  const value = isSuccess && flags ? flags[key] : undefined;

  return value;
}
