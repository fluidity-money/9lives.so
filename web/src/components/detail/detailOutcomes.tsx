import { combineClass } from "@/utils/combineClass";
import DetailOutcomeItem from "@/components/detail/detailOutcomeItem";
import { Outcome } from "@/types";
import { SelectedOutcome } from "../../types";
import React from "react";

export default function DetailOutcomes({
  data,
  sharePrices,
  selectedOutcome,
  setSelectedOutcome,
}: {
  data: Outcome[];
  sharePrices?: { id: string; price: string }[];
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
}) {
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
            key={outcome.identifier}
            data={outcome}
          />
        ))}
      </tbody>
    </table>
  );
}
