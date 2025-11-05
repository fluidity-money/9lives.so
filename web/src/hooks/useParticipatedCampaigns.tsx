import { requestUserParticipated } from "@/providers/graphqlClient";
import {
  CampaignDetail,
  ParticipatedCampaign,
  RawParticipatedCampaign,
} from "@/types";
import { formatParticipatedCampaign } from "@/utils/format/formatCampaign";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";

export default function useParticipatedCampaigns({
  campaignDetail,
}: {
  campaignDetail?: CampaignDetail;
}) {
  const account = useActiveAccount();

  return useInfiniteQuery({
    queryKey: ["participatedCampaigns", account?.address],
    queryFn: async ({ pageParam }) => {
      if (!account?.address) return [];
      const res = await requestUserParticipated(
        account?.address,
        pageParam,
        10,
      );
      return res.map((i) => formatParticipatedCampaign(i));
    },
    initialPageParam: 0,
    enabled: !!campaignDetail,
    initialData: campaignDetail
      ? {
          pages: [
            [
              {
                campaignId: campaignDetail.identifier as `0x${string}`,
                outcomeIds: campaignDetail.outcomes.map(
                  (o) => o.identifier,
                ) as `0x${string}`[],
                content: { ...campaignDetail },
              } as ParticipatedCampaign,
            ],
          ],
          pageParams: [0],
        }
      : undefined,
    getNextPageParam: (lastPage, pages, lastPageParam) => {
      if (lastPage.length < 10) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
}
