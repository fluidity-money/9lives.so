import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { Outcome, SelectedOutcome } from "@/types";
import React from "react";
import { formatUnits } from "ethers";
import config from "@/config";
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
}: {
  data: Outcome;
  price: string;
  amount?: bigint;
  chance?: number;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  isYesNo: boolean;
  isWinner: boolean;
  isConcluded: boolean;
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
        <div className="flex items-center gap-2 px-4">
          <div className="relative">
            {isWinner && (
              <Image
                alt=""
                width={20}
                className="absolute inset-x-0 -top-2 mx-auto h-auto"
                src={CrownImg}
              />
            )}
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
          {chance?.toFixed(0)}%
        </span>
      </td>
      <td
        className={combineClass(
          borderStyle,
          isSelected && "border-y border-y-9black",
        )}
      >
        <span className="font-chicago text-xs font-normal">
          ${formatUnits(amount ?? 0, config.contracts.decimals.fusdc)}
        </span>
      </td>
      <td
        className={combineClass(
          borderStyle,
          isSelected && "border-y border-y-9black",
        )}
      >
        <p className="min-h-[50px] font-chicago text-xs font-normal leading-[50px]">
          {`$ ${price}/Share`}
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
    </tr>
  );
}
