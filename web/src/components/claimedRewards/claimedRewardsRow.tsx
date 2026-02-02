import Link from "next/link";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import formatFusdc from "@/utils/format/formatUsdc";
import { calcTimePassed } from "@/utils/calcTimeDiff";
import { ClaimedCampaign } from "@/types";

export default function ClaimedCampaignRow({
  data,
}: {
  data: ClaimedCampaign;
}) {
  if (!data) return null;
  const winnerOutcome = data.content.outcomes.find(
    (o) => o.identifier === data.winner,
  )!;
  return (
    <tr>
      <td>
        <div className="flex items-center">
          {data.content.picture ? (
            <Image
              width={40}
              height={40}
              src={data.content.picture}
              alt={data.content.name}
              className="size-10 border border-9black"
            />
          ) : null}
          <div className="flex flex-col gap-1 p-1">
            <Link href={`/v1/campaign/${data.content.identifier}`}>
              <p className="font-chicago text-xs font-bold underline">
                {data.content.name}
              </p>
            </Link>
            <Link
              target="_blank"
              href={`https://explorer.superposition.so/tx/${data.txHash}`}
            >
              <span className="font-geneva text-xs uppercase text-[#808080]">
                Tx Hash:
              </span>{" "}
              <span className="font-geneva text-xs uppercase underline">
                {data.txHash.slice(0, 4)}...{data.txHash.slice(-4)}
              </span>
            </Link>
          </div>
        </div>
      </td>
      <td>
        <div className="flex items-center">
          {winnerOutcome.picture ? (
            <Image
              src={winnerOutcome.picture}
              alt={winnerOutcome.name}
              className="size-10 border border-9black"
            />
          ) : null}
          <div>
            <span className="font-chicago text-xs">{winnerOutcome.name}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2.5">
          <span className="font-chicago text-sm font-bold">
            ${formatFusdc(+data.fusdcReceived, 2)}
          </span>
          {data.pnl ? (
            <span
              className={combineClass(
                Number(data.pnl) > 0 ? "bg-9green" : "bg-9red",
                "px-1 py-0.5 font-geneva text-xs uppercase",
              )}
            >
              ${formatFusdc(BigInt(data.pnl), 2)}
            </span>
          ) : (
            <span
              className={"bg-9red px-1 py-0.5 font-geneva text-xs uppercase"}
            >
              Refund
            </span>
          )}
        </div>
      </td>
      <td>
        <span className="font-chicago text-xs">
          {formatFusdc(+data.sharesSpent, 2)}{" "}
          <span
            className={combineClass(
              "p-0.5",
              winnerOutcome.name === "Yes"
                ? "bg-9green"
                : winnerOutcome.name === "No"
                  ? "bg-9red"
                  : "bg-9gray",
            )}
          >
            {winnerOutcome.name}
          </span>
        </span>
      </td>
      <td title={new Date(data.createdAt * 1000).toISOString()}>
        <span className="font-chicago text-xs">
          {calcTimePassed(data.createdAt * 1000).text}
        </span>
      </td>
    </tr>
  );
}
