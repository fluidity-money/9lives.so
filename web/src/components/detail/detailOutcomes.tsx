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
  tradingAddr: string
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
}) {
  const { data: chances } = useChances({
    tradingAddr,
    outcomeId: selectedOutcome.id as `0x${string}`,
    outcomes: data
  })
  const borderStyle = "border-y border-y-gray-200";

  return (
    <table className="w-full border-separate border-spacing-0">
      <thead>
        <tr>
          <th
            className={combineClass(
              borderStyle,
              "py-3 text-left font-chicago text-xs font-normal uppercase text-gray-400",
            )}
          >
            Outcome
          </th>
          <th
            className={combineClass(
              borderStyle,
              "text-left font-chicago text-xs font-normal uppercase text-gray-400",
            )}
          >
            Chance %
          </th>
          <th className={borderStyle}></th>
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
            chance={chances?.find(chance => chance.id === outcome.identifier)?.chance}
            key={outcome.identifier}
            data={outcome}
          />
        ))}
      </tbody>
    </table>
  );
}
