import { combineClass } from "@/utils/combineClass";
import DetailOutcomeRow from "@/components/detail/detailOutcomeRow";
import { Outcome } from "@/types";
import { SelectedOutcome } from "../../types";
import React from "react";
import useChances from "@/hooks/useChances";

export default function DetailOutcomes({
  data,
  sharePrices,
  selectedOutcome,
  tradingAddr,
  setSelectedOutcome,
}: {
  data: Outcome[];
  sharePrices?: { id: string; price: string }[];
  selectedOutcome: SelectedOutcome;
  tradingAddr: `0x${string}`;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
}) {
  const outcomeIds = data.map((o) => o.identifier);
  const chances = useChances({
    tradingAddr,
    outcomeIds,
  });
  const titles = ["Outcome", "Chance %", "Invested", ""];
  return (
    <table className="w-full border-separate border-spacing-0">
      <thead>
        <tr>
          {titles.map((title, index) => (
            <th
              key={index}
              className={combineClass(
                index === 0 && "py-3",
                "border-y border-y-gray-200 text-left font-chicago text-xs font-normal uppercase text-gray-400",
              )}
            >
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((outcome) => (
          <DetailOutcomeRow
            selectedOutcome={selectedOutcome}
            setSelectedOutcome={setSelectedOutcome}
            price={
              sharePrices?.find((item) => item.id === outcome.identifier)
                ?.price ?? "0"
            }
            chance={
              chances?.find((chance) => chance.id === outcome.identifier)!
                .chance
            }
            amount={
              chances?.find((chance) => chance.id === outcome.identifier)!
                .investedAmount
            }
            key={outcome.identifier}
            data={outcome}
          />
        ))}
      </tbody>
    </table>
  );
}
