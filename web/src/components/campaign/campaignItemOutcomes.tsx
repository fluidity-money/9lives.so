import { CampaignListQuery } from "@/gql/graphql";
import Button from "../themed/button";
import React from "react";
import type { SelectedBet } from "./campaignItem";
import Link from "next/link";
interface CampaignItemOutcomesProps {
  campaignId: string;
  outcomes: CampaignListQuery["campaigns"][number]["outcomes"];
  setSelectedBet: React.Dispatch<SelectedBet>;
}
export default function CampaignItemOutcomes({
  campaignId,
  outcomes,
  setSelectedBet,
}: CampaignItemOutcomesProps) {
  function handleSelect(data: Omit<SelectedBet, "bet">, bet: boolean) {
    setSelectedBet({ ...data, bet });
  }

  if (outcomes.length === 1)
    return (
      <div className="flex flex-1 items-end gap-2">
        <Button
          intent="yes"
          title="Bet Yes"
          onClick={() => handleSelect(outcomes[0], false)}
          className={"flex-1"}
        />
        <Button
          intent="no"
          title="Bet No"
          onClick={() => handleSelect(outcomes[0], true)}
          className={"flex-1"}
        />
      </div>
    );

  return (
    <ul className="flex h-20 flex-col gap-1 overflow-y-scroll">
      {outcomes.map((outcome) => (
        <li
          key={outcome.identifier}
          className="flex items-center justify-between text-xs"
        >
          <Link href={`/event?id=${campaignId}`}>
            <span className="">{outcome.name}</span>
          </Link>
          <div className="flex items-center gap-1">
            <span>{"%75"}</span>
            <Button
              intent="yes"
              size="small"
              title="Yes"
              onClick={() => handleSelect(outcome, true)}
            />
            <Button
              intent="no"
              size="small"
              title="No"
              onClick={() => handleSelect(outcome, true)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
