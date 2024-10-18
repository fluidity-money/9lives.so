import Button from "../themed/button";
import React from "react";
import Link from "next/link";
import { Outcome, SelectedOutcome } from "@/types";
interface CampaignItemOutcomesProps {
  campaignId: string;
  outcomes: Outcome[];
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
}
export default function CampaignItemOutcomes({
  campaignId,
  outcomes,
  setSelectedOutcome,
}: CampaignItemOutcomesProps) {
  if (outcomes.length === 2)
    return (
      <div className="flex flex-1 items-end gap-2 my-5">
        <Button
          intent="yes"
          size={"large"}
          title={`Bet on ${outcomes[0].name}`}
          onClick={() =>
            setSelectedOutcome({ id: outcomes[0].identifier, state: "buy" })
          }
          className={"flex-1"}
        />
        <Button
          intent="no"
          size={"large"}
          title={`Bet on ${outcomes[1].name}`}
          onClick={() =>
            setSelectedOutcome({ id: outcomes[1].identifier, state: "buy" })
          }
          className={"flex-1"}
        />
      </div>
    );

  return (
    <ul className="flex h-20 flex-col gap-1 overflow-y-auto">
      {outcomes.map((outcome) => (
        <li
          key={outcome.identifier}
          className="flex items-center justify-between text-xs"
        >
          <Link href={`/campaign/${campaignId}`}>
            <span className="text-xs font-normal">{outcome.name}</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-chicago text-sm font-normal">{"%75"}</span>
            <Link href={`/campaign/${campaignId}`}>
              <Button
                intent="default"
                cat="secondary"
                size="small"
                title="Bet"
              />
            </Link>
            {/* <Button
              intent="yes"
              cat="secondary"
              size="small"
              title="Buy"
              onClick={() =>
                setSelectedOutcome({ id: outcome.identifier, state: "buy" })
              }
            />
            <Button
              intent="no"
              cat="secondary"
              size="small"
              title="Sell"
              onClick={() =>
                setSelectedOutcome({ id: outcome.identifier, state: "sell" })
              }
            /> */}
          </div>
        </li>
      ))}
    </ul>
  );
}
