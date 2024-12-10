import { requestTotalUserCount } from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";

export async function getTotalUserCount() {
  return await requestTotalUserCount;
}

export const getCachedTotalUserCount = unstable_cache(
  getTotalUserCount,
  ["totalUserCount"],
  {
    revalidate: 60,
    tags: ["totalUserCount"],
  },
);
