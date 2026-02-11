import Button from "../themed/button";
import { useMemo } from "react";
import Link from "next/link";
import { Outcome } from "@/types";
import { useRouter } from "next/navigation";
import getAmmPrices from "@/utils/getAmmPrices";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import getDppmPrice from "@/utils/getDppmPrice";
interface CampaignItemOutcomesProps {
  campaignId: string;
  outcomes: Outcome[];
  isYesNo: boolean;
  isDppm: boolean;
  odds: Record<string, string> | null;
  isConcluded: boolean;
  shares: ({
    shares: string;
    identifier: string;
  } | null)[];
}
export default function CampaignItemOutcomes({
  campaignId,
  outcomes,
  shares,
  isYesNo,
  odds,
  isConcluded,
  isDppm,
}: CampaignItemOutcomesProps) {
  const router = useRouter();
  const prices = useMemo(() => getAmmPrices(shares), [shares]);
  const otherPrices = getDppmPrice(odds);
  const yesPrice =
    (isDppm
      ? otherPrices.find(
          (op) =>
            op.identifier === outcomes.find((o) => o.name === "Up")?.identifier,
        )?.price
      : prices?.get(outcomes[0].identifier)) ?? 0.5;
  const isOddsEnabled = useFeatureFlag("display odds on campaign items");
  if (isConcluded)
    return (
      <Button
        intent={"cta"}
        size={"large"}
        title={"Claim rewards"}
        onClick={() => router.push(`/v1/campaign/${campaignId}`)}
        className={"flex-1"}
      />
    );

  if (isYesNo || isDppm)
    return (
      <>
        <div className="flex flex-1 items-end gap-2">
          <Button
            intent={"yes"}
            size={"large"}
            title={isDppm ? "Up" : outcomes[0].name}
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/v1/campaign/${campaignId}?outcomeId=${isDppm ? outcomes[1].identifier : outcomes[0].identifier}`,
              );
            }}
            className={"flex-1 truncate"}
          />
          <Button
            intent={"no"}
            size={"large"}
            title={isDppm ? "Down" : outcomes[1].name}
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/v1/campaign/${campaignId}?outcomeId=${isDppm ? outcomes[0].identifier : outcomes[1].identifier}`,
              );
            }}
            className={"flex-1 truncate"}
          />
        </div>
        {yesPrice && isOddsEnabled ? (
          <div className="flex flex-row items-center gap-1">
            <span className="font-chicago text-sm">
              %{+(yesPrice * 100).toFixed(0)}
            </span>
            <div className="h-2 flex-1 bg-9red">
              <div
                className="h-2 bg-9green"
                style={{ width: `${yesPrice * 100}%` }}
              />
            </div>
          </div>
        ) : null}
      </>
    );

  return (
    <ul className="flex grow flex-col gap-1 overflow-y-auto">
      {outcomes.map((outcome) => {
        const price = prices?.get(outcome.identifier);
        return (
          <li
            key={outcome.identifier}
            className="flex items-center justify-between text-xs"
          >
            <Link href={`/v1/campaign/${campaignId}`} className="truncate">
              <span className="truncate text-xs font-normal">
                {outcome.name}
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {price && isOddsEnabled ? (
                <span className="font-chicago text-sm font-normal">
                  %{+(price * 100).toFixed(0)}
                </span>
              ) : null}
              <Button
                intent="default"
                cat="secondary"
                size="small"
                title="Predict"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/v1/campaign/${campaignId}?outcomeId=${outcome.identifier}`,
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
        );
      })}
    </ul>
  );
}
