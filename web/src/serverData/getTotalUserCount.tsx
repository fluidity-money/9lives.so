import { requestTotalUserCount } from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";
import appConfig from "@/config";

export async function getTotalUserCount() {
  return (await requestTotalUserCount).productUserCount as number;
}

export const getCachedTotalUserCount = unstable_cache(
  getTotalUserCount,
  ["totalUserCount"],
  {
    revalidate: appConfig.cacheRevalidation.homePage,
    tags: ["totalUserCount"],
  },
);
