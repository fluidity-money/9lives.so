import {
  requestBuysAndSells,
  requestCreations,
} from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";

export const getCachedCreations = unstable_cache(
  requestCreations,
  ["creations"],
  {
    revalidate: 3600,
    tags: ["creations"],
  },
);
export const getCachedBuysAndSells = unstable_cache(
  requestBuysAndSells,
  ["buysAndSells"],
  {
    revalidate: 3600,
    tags: ["buysAndSells"],
  },
);
