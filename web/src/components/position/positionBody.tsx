import { CampaignDetail, ParticipatedCampaign } from "@/types";
import PositionsGroup from "./positionGroup";
import Placeholder from "../tablePlaceholder";
import Button from "../themed/button";
import useParticipatedCampaigns from "@/hooks/useParticipatedCampaigns";
const bodyStyles = "min-h-24 bg-9gray";

export default function PositionBody({
  colSpan,
  hideSmallBalances,
  campaignDetail,
}: {
  colSpan: number;
  hideSmallBalances: boolean;
  campaignDetail?: CampaignDetail;
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
    <tbody className={bodyStyles}>
      {isError ? (
        <Placeholder
          title="Error"
          subtitle={error?.message ?? "Unknown Error"}
        />
      ) : isLoading ? (
        <Placeholder title="Loading.." colSpan={colSpan} />
      ) : positionGroups?.length === 0 ? (
        <Placeholder
          title="Nothing yet."
          subtitle="Start Growing Your Portfolio."
          colSpan={colSpan}
        />
      ) : positionGroups ? (
        positionGroups.map((group) => (
          <PositionsGroup
            colSpan={colSpan}
            content={group.content}
            outcomeIds={group.outcomeIds}
            hideSmallBalances={hideSmallBalances}
            detailPage={!!campaignDetail}
            key={group.content.poolAddress}
            campaignId={group.campaignId}
          />
        ))
      ) : null}
      {campaignDetail ? null : (
        <tr>
          <td colSpan={6}>
            <div className="flex items-center justify-center">
              {hasNextPage ? (
                <Button
                  intent={"cta"}
                  disabled={isFetchingNextPage}
                  title={isFetchingNextPage ? "Loading" : "Show More"}
                  onClick={() => fetchNextPage()}
                />
              ) : (
                <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
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
