import { PositionsProps } from "@/types";
import PositionsGroup from "./positionGroup";
import Placeholder from "../tablePlaceholder";
const bodyStyles = "min-h-24 bg-9gray";

export default function PositionBody({
  positionGroups,
  areGroupsLoading,
}: {
  positionGroups: PositionsProps[];
  areGroupsLoading?: boolean;
}) {
  return (
    <tbody className={bodyStyles}>
      {areGroupsLoading ? (
        <Placeholder title="Loading.." />
      ) : positionGroups?.length === 0 ? (
        <Placeholder
          title="Nothing yet."
          subtitle="Start Growing Your Portfolio."
        />
      ) : (
        positionGroups.map((group) => (
          <PositionsGroup
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
