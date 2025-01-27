import { combineClass } from "@/utils/combineClass";
import DetailOutcomeRow from "@/components/detail/detailOutcomeRow";
import { CampaignDetail } from "@/types";
import { SelectedOutcome } from "../../types";
import React from "react";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import useChances from "@/hooks/useChances";

export default function DetailOutcomes({
  data,
  sharePrices,
  selectedOutcome,
  setSelectedOutcome,
  isConcluded,
}: {
  data: CampaignDetail;
  sharePrices?: { id: string; price: string }[];
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  isConcluded: boolean;
}) {
  const titles = ["Outcome", "Chance %", "Invested", "Current Price", ""];
  const displayQuickActions = useFeatureFlag("display quick actions");
  const outcomeIds = data.outcomes.map((o) => o.identifier as `0x${string}`);
  const chances = useChances({
    investmentAmounts: data.investmentAmounts,
    totalVolume: data.totalVolume,
    outcomeIds,
  });
  return (
    <table className="w-full border-separate border-spacing-0">
      <thead>
        <tr>
          {titles.map((title, index) =>
            !displayQuickActions && index === titles.length - 1 ? null : (
              <th
                key={index}
                className={combineClass(
                  index === 0 && "py-3",
                  "border-y border-y-gray-200 text-left font-chicago text-xs font-normal uppercase text-gray-400",
                )}
              >
                {title}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {data.outcomes.map((outcome) => {
          const chance = chances?.find(
            (chance) => chance.id === outcome.identifier,
          )!.chance;
          const amount = chances?.find(
            (chance) => chance.id === outcome.identifier,
          )!.investedAmount;
          return (
            <DetailOutcomeRow
              isYesNo={data.isYesNo}
              selectedOutcome={selectedOutcome}
              setSelectedOutcome={setSelectedOutcome}
              price={
                data.winner && outcome.identifier !== `0x${data.winner}`
                  ? "0"
                  : (sharePrices?.find((item) => item.id === outcome.identifier)
                      ?.price ?? "0")
              }
              chance={chance}
              amount={amount}
              isWinner={outcome.identifier === `0x${data.winner}`}
              key={outcome.identifier}
              data={outcome as CampaignDetail["outcomes"][number]}
              displayQuickActions={displayQuickActions}
              isConcluded={isConcluded}
            />
          );
        })}
      </tbody>
    </table>
  );
}
