import Link from "next/link";
import config from "@/config";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { useEffect } from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import formatFusdc from "@/utils/formatFusdc";

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
    outcomePic?: string;
  };
  price?: string;
  history?: { usdc: number; share: number; id: string; txHash: string }[];
}) {
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
  }, [price, data.id, data.balance]);
  return (
    <>
      <tr>
        <td className="flex items-center">
          {data.outcomePic ? (
            <Image
              src={data.outcomePic}
              alt={data.name + "_" + data.campaignName}
              className="size-10 border border-9black"
            />
          ) : null}
          <div className="flex flex-col gap-1 p-1">
            {data.campaignName ? (
              <p className="font-chicago text-xs font-bold">
                {data.campaignName}
              </p>
            ) : null}
            <p className="font-geneva text-xs uppercase tracking-wide text-[#808080]">
              {data.name}
            </p>
            <Link
              href={`${config.chains.currentChain.blockExplorers![0].url}/token/${data.shareAddress}`}
              target="_blank"
            >
              <span className="font-geneva text-[10px] uppercase text-[#808080] underline">
                {data.shareAddress.slice(0, 4)}...{data.shareAddress.slice(-4)}
              </span>
            </Link>
          </div>
        </td>
        <td>
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
          <span className="font-chicago text-xs">
            {price
              ? "$" + (Number(data.balance) * Number(price)).toFixed(2)
              : "?"}
          </span>
        </td>
        <td>
          {historicalValue ? (
            <span
              className={combineClass(
                "p-0.5 font-chicago text-xs",
                PnL >= 0 ? "bg-9green" : "bg-9red",
              )}
            >
              {PnL.toFixed(2)}
            </span>
          ) : null}
        </td>
      </tr>
      {history?.map((h) => {
        return (
          <tr key={h.txHash}>
            <td>
              <span className="pl-2 font-geneva text-xs uppercase tracking-wide text-[#808080]">
                BUY tx
              </span>
            </td>
            <td>
              <span className="font-chicago text-xs">
                {(h.usdc / h.share).toFixed(2)}
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
