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
        className={"flex-1"}
      />
    );

  if (outcomes.length === 2 || isYesNo)
    return (
      <div className="flex flex-1 items-end gap-2">
        <Button
          intent={isYesNo ? "yes" : "default"}
          size={"large"}
          title={outcomes[0].name}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/campaign/${campaignId}`);
          }}
          className={"flex-1 truncate"}
        />
        <Button
          intent={isYesNo ? "no" : "default"}
          size={"large"}
          title={outcomes[1].name}
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              `/campaign/${campaignId}?outcomeId=${outcomes[1].identifier}`,
            );
          }}
          className={"flex-1 truncate"}
        />
      </div>
    );

  return (
    <ul className="flex grow flex-col gap-1 overflow-y-auto">
      {outcomes.map((outcome) => (
        <li
          key={outcome.identifier}
          className="flex items-center justify-between text-xs"
        >
          <Link href={`/campaign/${campaignId}`} className="truncate">
            <span className="truncate text-xs font-normal">{outcome.name}</span>
          </Link>
          <div className="flex items-center gap-1">
            {/* <span className="font-chicago text-sm font-normal">{"%75"}</span> */}
            <Button
              intent="default"
              cat="secondary"
              size="small"
              title="Predict"
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
