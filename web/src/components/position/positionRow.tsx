import Link from "next/link";
import config from "@/config";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import formatFusdc from "@/utils/formatFusdc";
import Button from "../themed/button";
import DownCaret from "#/icons/down-caret.svg";
export default function PositionRow({
  data,
  price,
  history,
}: {
  data: {
    id: `0x${string}`;
    shareAddress: `0x${string}`;
    name: string;
    balance: string;
    campaignName?: string;
    campaignId?: string;
    outcomePic?: string;
    winner?: string;
  };
  price?: string;
  history?: { usdc: number; share: number; id: string; txHash: string }[];
}) {
  const [showHistory, setShowHistory] = useState(false);
  const historicalValue = history?.reduce((acc, v) => acc + v.usdc, 0) ?? 0;
  const addPosition = usePortfolioStore((s) => s.addPositionValue);
  const PnL =
    Number(data.balance) * Number(price) - +formatFusdc(historicalValue, 6);
  useEffect(() => {
    if (price && data.id && data.balance) {
      addPosition({
        outcomeId: data.id,
        value: Number(price) * Number(data.balance),
      });
    }
  }, [price, data.id, data.balance, addPosition]);
  return (
    <>
      <tr>
        <td
          className="flex cursor-pointer items-center justify-between bg-[#DDDDDD] p-2"
          onClick={() => setShowHistory(!showHistory)}
        >
          <div className="flex items-center gap-4">
            {data.outcomePic ? (
              <Image
                src={data.outcomePic}
                alt={data.name + "_" + data.campaignName}
                className="size-10 border border-9black"
              />
            ) : null}
            <div className="flex flex-col gap-1">
              {data.campaignName ? (
                <p className="font-chicago text-xs font-bold">
                  <Link
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="underline"
                    href={`/campaign/${data.campaignId}`}
                  >
                    {data.campaignName}
                  </Link>{" "}
                  {data.winner && (
                    <span className="bg-9yellow p-0.5 font-geneva text-[10px] uppercase tracking-wide">
                      Concluded
                    </span>
                  )}
                  {data.winner && data.winner === data.id && (
                    <span className="font-notmal ml-1 bg-9green p-0.5 font-geneva text-[10px] uppercase tracking-wide">
                      Winner
                    </span>
                  )}
                  {data.winner && data.winner !== data.id && (
                    <span className="font-notmal ml-1 bg-9red p-0.5 font-geneva text-[10px] uppercase tracking-wide">
                      Defeated
                    </span>
                  )}
                </p>
              ) : null}

              <p className="font-geneva text-xs uppercase tracking-wide text-[#808080]">
                {data.name}
              </p>
              <div className="flex items-center gap-1">
                {data.campaignId ? (
                  <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
                    Share Addr:
                  </span>
                ) : null}
                <Link
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  href={`${config.chains.currentChain.blockExplorers![0].url}/token/${data.shareAddress}`}
                  target="_blank"
                  className="inline self-start"
                >
                  <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080] underline">
                    {data.shareAddress.slice(0, 4)}...
                    {data.shareAddress.slice(-4)}
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <Image
            src={DownCaret}
            alt=""
            className={combineClass("size-4", showHistory && "rotate-180")}
          />
        </td>
        <td className="pl-2">
          <span className="font-chicago text-xs">${price}</span>
        </td>
        <td>
          <span className="font-chicago text-xs">
            {data.balance}{" "}
            <span
              className={combineClass(
                "p-0.5",
                data.name === "Yes"
                  ? "bg-9green"
                  : data.name === "No"
                    ? "bg-9red"
                    : "bg-9gray",
              )}
            >
              {data.name}
            </span>
          </span>
        </td>
        <td>
          <div className="flex flex-col gap-1">
            <span className="font-chicago text-xs">
              {price
                ? "$" + (Number(data.balance) * Number(price)).toFixed(2)
                : "?"}
            </span>
            <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
              COST ${formatFusdc(historicalValue, 2)}
            </span>
          </div>
        </td>
        <td>
          {data.winner === data.id ? (
            <Button title="Claim Reward" intent={"yes"} />
          ) : historicalValue ? (
            <span
              className={combineClass(
                "p-0.5 font-chicago text-xs",
                PnL >= 0 ? "bg-9green" : "bg-9red",
              )}
            >
              {PnL >= 0 ? "+" : "-"} ${Math.abs(PnL).toFixed(2)}
            </span>
          ) : null}
        </td>
      </tr>
      {showHistory &&
        history?.map((h) => {
          return (
            <tr key={h.txHash} className="bg-[#DDDDDD]">
              <td>
                <span className="pl-2 font-geneva text-xs uppercase tracking-wide text-[#808080]">
                  BUY tx
                </span>
              </td>
              <td className="pl-2">
                <span className="font-chicago text-xs">
                  ${(h.usdc / h.share).toFixed(2)}
                </span>
              </td>
              <td>
                <span className="font-chicago text-xs">
                  {formatFusdc(h.share, 2)}{" "}
                  <span
                    className={combineClass(
                      "p-0.5",
                      data.name === "Yes"
                        ? "bg-9green"
                        : data.name === "No"
                          ? "bg-9red"
                          : "bg-9gray",
                    )}
                  >
                    {data.name}
                  </span>
                </span>
              </td>
              <td>
                <span className="font-chicago text-xs">
                  ${formatFusdc(h.usdc, 2)}
                </span>
              </td>
              <td>
                <span className="font-chicago text-xs"></span>
              </td>
              <td></td>
            </tr>
          );
        })}
    </>
  );
}
