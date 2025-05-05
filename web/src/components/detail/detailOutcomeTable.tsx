import { combineClass } from "@/utils/combineClass";
import DetailOutcomeRow from "@/components/detail/detailOutcomeRow";
import { CampaignDetail } from "@/types";
import { SelectedOutcome } from "../../types";
import React from "react";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import formatFusdc from "@/utils/formatFusdc";

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
          const amount =
            data.investmentAmounts.find(
              (item) => item.id === outcome.identifier,
            )?.usdc ?? 0;
          const sharePrice =
            sharePrices?.find((item) => item.id === outcome.identifier)
              ?.price ?? "0";
          const price =
            data.winner && outcome.identifier !== data.winner
              ? "0"
              : sharePrice;
          const chance = Number(price) * 100;
          return (
            <DetailOutcomeRow
              isYesNo={data.isYesNo}
              selectedOutcome={selectedOutcome}
              setSelectedOutcome={setSelectedOutcome}
              price={price}
              chance={chance}
              amount={formatFusdc(amount, 2)}
              isWinner={outcome.identifier === data.winner}
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
