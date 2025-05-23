import { PositionsProps } from "@/types";
import PositionsGroup from "./positionGroup";
import Placeholder from "../tablePlaceholder";
const bodyStyles = "min-h-24 bg-9gray";

export default function PositionBody({
  positionGroups,
  areGroupsLoading,
  detailPage,
  isDpm,
  colSpan,
}: {
  positionGroups: PositionsProps[];
  areGroupsLoading?: boolean;
  detailPage?: boolean;
  isDpm?: boolean;
  colSpan: number;
}) {
  return (
    <tbody className={bodyStyles}>
      {areGroupsLoading ? (
        <Placeholder title="Loading.." colSpan={colSpan} />
      ) : positionGroups?.length === 0 ? (
        <Placeholder
          title="Nothing yet."
          subtitle="Start Growing Your Portfolio."
          colSpan={colSpan}
        />
      ) : (
        positionGroups.map((group) => (
          <PositionsGroup
            colSpan={colSpan}
            isDpm={isDpm}
            detailPage={detailPage}
            key={group.tradingAddr}
            tradingAddr={group.tradingAddr}
            outcomes={group.outcomes}
            campaignName={group.campaignName}
            campaignId={group.campaignId}
            winner={group.winner}
          />
        ))
      )}
    </tbody>
  );
}
