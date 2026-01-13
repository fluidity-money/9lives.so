import { requestUserParticipated } from "@/providers/graphqlClient";
import { CampaignDetail, ParticipatedCampaign } from "@/types";
import { formatParticipatedCampaign } from "@/utils/format/formatCampaign";
import { useAppKitAccount } from "@reown/appkit/react";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useParticipatedCampaigns({
  campaignDetail,
}: {
  campaignDetail?: CampaignDetail;
}) {
  const account = useAppKitAccount();

  return useInfiniteQuery({
    queryKey: [
      "participatedCampaigns",
      account?.address,
      campaignDetail?.identifier,
    ],
    queryFn: async ({ pageParam }) => {
      if (!account?.address) return [];
      const data = await requestUserParticipated(
        account?.address,
        pageParam,
        10,
      );
      return data.map((i) => formatParticipatedCampaign(i));
    },
    initialPageParam: 0,
    enabled: !campaignDetail,
    initialData: campaignDetail
      ? {
          pages: [
            [
              {
                campaignId: campaignDetail.identifier as `0x${string}`,
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
