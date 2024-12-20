import { useQuery } from "@tanstack/react-query";
import featureBlob from "../../../features/features.json";
type FeatureFlags = typeof featureBlob;
export default function useFeatureFlag(
  key: keyof FeatureFlags,
): FeatureFlags[typeof key] | undefined {
  const { data } = useQuery<FeatureFlags>({ queryKey: ["features"] });
  return data?.[key];
}
