import { PositionsProps } from "@/types";
import PositionsGroup, { Placeholder } from "./positionGroup";
const bodyStyles = "min-h-24 bg-9gray";

export default function PositionBody({
  positionGroups,
}: {
  positionGroups: PositionsProps[];
}) {
  return (
    <tbody className={bodyStyles}>
      {positionGroups?.length === 0 ? (
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
          />
        ))
      )}
    </tbody>
  );
}
