import { CampaignDetail, ParticipatedCampaign } from "@/types";
import PositionsGroup from "./positionGroup";
import Placeholder from "../tablePlaceholder";
import Button from "../themed/button";
import ModernButton from "../v2/button";
import useParticipatedCampaigns from "@/hooks/useParticipatedCampaigns";

export default function PositionBody({
  colSpan,
  hideSmallBalances,
  campaignDetail,
  modern = false,
}: {
  colSpan: number;
  hideSmallBalances: boolean;
  campaignDetail?: CampaignDetail;
  modern?: boolean;
}) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useParticipatedCampaigns({
    campaignDetail,
  });
  const positionGroups = data?.pages.flatMap((i) => i);
  return (
    <tbody className={modern ? "min-h-24" : "min-h-24 bg-9gray"}>
      {isError ? (
        <Placeholder
          title="Error"
          subtitle={error?.message ?? "Unknown Error"}
          colSpan={colSpan}
          modern={modern}
        />
      ) : isLoading ? (
        <Placeholder title="Loading.." colSpan={colSpan} modern={modern} />
      ) : positionGroups?.length === 0 ? (
        <Placeholder
          title="Nothing yet."
          subtitle="Start Growing Your Portfolio."
          colSpan={colSpan}
          modern={modern}
        />
      ) : positionGroups ? (
        positionGroups.map((group) => (
          <PositionsGroup
            colSpan={colSpan}
            content={group.content}
            hideSmallBalances={hideSmallBalances}
            detailPage={!!campaignDetail}
            key={group.content.poolAddress}
            campaignId={group.campaignId}
            modern={modern}
          />
        ))
      ) : null}
      {campaignDetail ? null : (
        <tr>
          <td colSpan={6}>
            <div className="flex items-center justify-center">
              {hasNextPage ? (
                modern ? (
                  <ModernButton
                    disabled={isFetchingNextPage}
                    title={isFetchingNextPage ? "Loading" : "Show more"}
                    onClick={() => fetchNextPage()}
                  />
                ) : (
                  <Button
                    intent={"cta"}
                    disabled={isFetchingNextPage}
                    title={isFetchingNextPage ? "Loading" : "Show More"}
                    onClick={() => fetchNextPage()}
                  />
                )
              ) : (
                <span
                  className={
                    modern
                      ? "text-xs text-neutral-400"
                      : "font-geneva text-[10px] leading-3 tracking-wide text-[#808080] uppercase"
                  }
                >
                  End of results
                </span>
              )}
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
}
