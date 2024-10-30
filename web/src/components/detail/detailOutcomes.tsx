import { combineClass } from "@/utils/combineClass";
import DetailOutcomeItem from "@/components/detail/detailOutcomeItem";
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
  tradingAddr: string;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
}) {
  const { data: chances } = useChances({
    tradingAddr,
    outcomes: data,
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
          <DetailOutcomeItem
            selectedOutcome={selectedOutcome}
            setSelectedOutcome={setSelectedOutcome}
            price={
              sharePrices?.find((item) => item.id === outcome.identifier)
                ?.price ?? "0"
            }
            chance={
              chances?.find((chance) => chance.id === outcome.identifier)
                ?.chance
            }
            amount={
              chances?.find((chance) => chance.id === outcome.identifier)
                ?.investedAmount
            }
            key={outcome.identifier}
            data={outcome}
          />
        ))}
      </tbody>
    </table>
  );
}
