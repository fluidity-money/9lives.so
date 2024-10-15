import Image from "next/image";
import CatImage from "#/images/cat.png";
import Button from "../themed/button";
import { combineClass } from "@/utils/combineClass";
import { Outcome, SelectedOutcome } from "@/types";
import React from "react";

export default function DetailOutcomeItem({
  data,
  selectedOutcome,
  setSelectedOutcome,
}: {
  data: Outcome;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
}) {
  const borderStyle = "border-b border-b-gray-200";

  const isSelected = selectedOutcome.id === data.identifier;

  return (
    <tr
      onClick={() =>
        setSelectedOutcome({ ...selectedOutcome, id: data.identifier })
      }
      key={data.identifier}
      className={combineClass(
        isSelected
          ? "rounded-sm bg-9blueLight shadow-9selectedOutcome"
          : "hover:bg-9blueLight/50",
        "cursor-pointer",
      )}
    >
      <td
        className={combineClass(
          borderStyle,
          isSelected &&
            "rounded-l-sm border-y border-l border-y-9black border-l-9black",
        )}
      >
        <div className="flex items-center gap-2 px-4">
          <Image
            width={40}
            height={40}
            alt={data.name}
            src={CatImage}
            className="border border-9black"
          />
          <h2 className="text-sm font-normal tracking-wide">{data.name}</h2>
        </div>
      </td>
      <td
        className={combineClass(
          borderStyle,
          isSelected && "border-y border-y-9black",
        )}
      >
        <span className="font-chicago text-xs font-normal">75%</span>
      </td>
      <td
        className={combineClass(
          borderStyle,
          "flex items-end justify-end gap-2 p-4",
          isSelected &&
            "rounded-r-sm border-y border-r border-y-9black border-r-9black",
        )}
      >
        <Button
          title="Buy"
          intent={"yes"}
          size={"large"}
          className={combineClass(
            isSelected &&
              selectedOutcome.state === 'buy' &&
              "bg-green-500 font-bold text-white hover:bg-green-500",
          )}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOutcome({ state: "buy", id: data.identifier });
          }}
        />
        <Button
          title="Sell"
          intent={"no"}
          size={"large"}
          className={combineClass(
            isSelected &&
              selectedOutcome.state === 'sell' &&
              "bg-red-500 font-bold text-white hover:bg-red-500",
          )}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOutcome({ state: "sell", id: data.identifier });
          }}
        />
      </td>
    </tr>
  );
}
