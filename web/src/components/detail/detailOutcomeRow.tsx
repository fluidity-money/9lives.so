import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { Outcome, SelectedOutcome } from "@/types";
import React from "react";
import CrownImg from "#/images/crown.svg";
import Button from "../themed/button";
import Link from "next/link";
import YesOutcomeImg from "#/images/yes-outcome.svg";
import NoOutcomeImg from "#/images/no-outcome.svg";
import LinkIcon from "#/icons/link.svg";
export default function DetailOutcomeRow({
  data,
  price,
  chance,
  amount,
  selectedOutcome,
  setSelectedOutcome,
  isYesNo,
  isWinner,
  isConcluded,
  displayQuickActions,
  isDpm,
}: {
  data: Outcome;
  price: string;
  amount?: string;
  chance?: number;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  isYesNo: boolean;
  isWinner: boolean;
  isConcluded: boolean;
  displayQuickActions?: boolean;
  isDpm?: boolean;
}) {
  const borderStyle = "border-b border-b-gray-200";
  const isSelected = selectedOutcome.id === data.identifier;
  return (
    <tr
      onClick={() =>
        !isConcluded &&
        setSelectedOutcome({ ...selectedOutcome, id: data.identifier })
      }
      key={data.identifier}
      className={combineClass(
        isSelected || isWinner
          ? "rounded-sm shadow-9selectedOutcome"
          : "hover:bg-9blueLight/50",
        isConcluded && isWinner && "bg-9green",
        !isConcluded && "cursor-pointer",
      )}
    >
      <td
        className={combineClass(
          borderStyle,
          isSelected &&
            "rounded-l-sm border-y border-l border-y-9black border-l-9black",
        )}
      >
        <div className="flex items-center gap-2 px-2 md:px-4">
          <div className="relative">
            {isWinner && (
              <Image
                alt=""
                width={20}
                className={combineClass(
                  data.picture ||
                    (!data.picture &&
                      isYesNo &&
                      "absolute inset-x-0 -top-2 mx-auto h-auto"),
                )}
                src={CrownImg}
              />
            )}
            {!!data.picture || (!data.picture && isYesNo) ? (
              <Image
                width={40}
                height={40}
                alt={data.name}
                src={
                  isYesNo
                    ? data.name === "Yes"
                      ? YesOutcomeImg
                      : NoOutcomeImg
                    : data.picture
                }
                className={combineClass(!isYesNo && "border border-9black")}
              />
            ) : null}
          </div>
          <h2 className="text-sm font-normal tracking-wide">{data.name}</h2>
        </div>
      </td>
      <td
        className={combineClass(
          borderStyle,
          isSelected && "border-y border-y-9black",
        )}
      >
        <span className="font-chicago text-xs font-normal">
          {isConcluded ? (isWinner ? "100" : "0") : chance?.toFixed(0)}%
        </span>
      </td>
      {isDpm ? (
        <td
          className={combineClass(
            borderStyle,
            isSelected && "border-y border-y-9black",
          )}
        >
          <span className="font-chicago text-xs font-normal">${amount}</span>
        </td>
      ) : null}
      <td
        className={combineClass(
          borderStyle,
          isSelected && "border-y border-y-9black",
          !displayQuickActions &&
            isSelected &&
            "rounded-r-sm border-r border-r-9black",
        )}
      >
        <p className="min-h-[50px] font-chicago text-xs font-normal leading-[50px]">
          {`$ ${Number(price).toFixed(2)}/Share`}
        </p>
        {/* <Button
          title="Buy"
          intent={"yes"}
          size={"large"}
          className={combineClass(
            isSelected &&
              selectedOutcome.state === "buy" &&
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
              selectedOutcome.state === "sell" &&
              "bg-red-500 font-bold text-white hover:bg-red-500",
          )}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOutcome({ state: "sell", id: data.identifier });
          }}
        /> */}
      </td>
      {displayQuickActions ? (
        <td
          className={combineClass(
            borderStyle,
            "flex items-end justify-end gap-2 p-4",
            isSelected &&
              "rounded-r-sm border-y border-r border-y-9black border-r-9black",
          )}
        >
          <Link
            href={"#"}
            // target="_blank"
            // rel="noopener,noreferrer"
          >
            <Button size={"medium"}>
              <div className="flex items-center gap-1">
                <span className="font-chicago text-xs">Trade</span>
                <Image src={LinkIcon} alt="" width={14} />
              </div>
            </Button>
          </Link>
          <Link
            href={`https://long.so/stake/pool?id=${data.share.address}`}
            target="_blank"
            rel="noopener,noreferrer"
          >
            <Button size={"medium"} disabled={isConcluded}>
              <div className="flex items-center gap-1">
                <span className="font-chicago text-xs">LP</span>
                <Image src={LinkIcon} alt="" width={14} />
              </div>
            </Button>
          </Link>
        </td>
      ) : null}
    </tr>
  );
}
