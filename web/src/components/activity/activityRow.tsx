import Link from "next/link";
import config from "@/config";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { Activity } from "@/types";
import { calcTimePassed } from "@/utils/calcTimeDiff";
import formatFusdc from "@/utils/format/formatUsdc";

export default function ActivityRow({
  data,
  displayCampaignName,
}: {
  data: Activity;
  displayCampaignName: boolean;
}) {
  return (
    <tr>
      <td className="flex items-center">
        {data?.outcomePic ? (
          <Image
            src={data.outcomePic}
            alt={data.campaignName}
            className="size-10 border border-9black"
          />
        ) : null}
        <div className="flex flex-col gap-1 p-1">
          {displayCampaignName ? (
            <Link href={`/campaign/${data.campaignId}`}>
              <p className="font-chicago text-xs font-bold underline">
                {data.campaignName}
              </p>
            </Link>
          ) : null}
          <p className="font-geneva text-xs uppercase tracking-wide text-[#808080]">
            {data.outcomeName}
          </p>
          <Link
            href={`${config.destinationChain.blockExplorers.default.url}/tx/${data.txHash}`}
            target="_blank"
          >
            <span className="font-geneva text-[10px] uppercase text-[#808080] underline">
              {data.txHash.slice(0, 4)}...{data.txHash.slice(-4)}
            </span>
          </Link>
        </div>
      </td>
      <td>
        <span
          className={combineClass(
            "p-0.5 font-chicago uppercase",
            data.type === "buy" ? "bg-9green" : "bg-9red",
          )}
        >
          {data.type}
        </span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          $
          {(data.type === "buy"
            ? data.fromAmount / data.toAmount
            : data.toAmount / data.fromAmount
          ).toFixed(2)}
        </span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          {formatFusdc(
            data.type === "buy" ? data.toAmount : data.fromAmount,
            2,
          )}{" "}
          <span
            className={combineClass(
              "p-0.5",
              data.outcomeName === "Yes"
                ? "bg-9green"
                : data.outcomeName === "No"
                  ? "bg-9red"
                  : "bg-9gray",
            )}
          >
            {data.outcomeName}
          </span>
        </span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          $
          {formatFusdc(
            data.type === "buy" ? data.fromAmount : data.toAmount,
            2,
          )}
        </span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          {calcTimePassed(data.createdAt * 1000).text}
        </span>
      </td>
    </tr>
  );
}
