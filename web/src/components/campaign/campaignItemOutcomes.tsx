import Button from "../themed/button";
import React from "react";
import Link from "next/link";
import { Outcome, SelectedOutcome } from "@/types";
import { useRouter } from "next/navigation";
interface CampaignItemOutcomesProps {
  campaignId: string;
  outcomes: Outcome[];
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  isYesNo: boolean;
  isConcluded: boolean;
}
export default function CampaignItemOutcomes({
  campaignId,
  outcomes,
  setSelectedOutcome,
  isYesNo,
  isConcluded,
}: CampaignItemOutcomesProps) {
  const router = useRouter();

  if (isConcluded)
    return (
      <Button
        intent={"cta"}
        size={"large"}
        title={"Claim rewards"}
        onClick={() => router.push(`/campaign/${campaignId}`)}
        className={"my-5 flex-1"}
      />
    );

  if (outcomes.length === 2 || isYesNo)
    return (
      <div className="my-5 flex flex-1 items-end gap-2">
        <Button
          intent={isYesNo ? "yes" : "default"}
          size={"large"}
          title={isYesNo ? outcomes[0].name : `Predict ${outcomes[0].name}`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/campaign/${campaignId}`);
          }}
          className={"flex-1"}
        />
        <Button
          intent={isYesNo ? "no" : "default"}
          size={"large"}
          title={isYesNo ? outcomes[1].name : `Predict ${outcomes[1].name}`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              `/campaign/${campaignId}?outcomeId=${outcomes[1].identifier}`,
            );
          }}
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
            <Button
              intent="default"
              cat="secondary"
              size="small"
              title="Bet"
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/campaign/${campaignId}?outcomeId=${outcome.identifier}`,
                );
              }}
            />
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
