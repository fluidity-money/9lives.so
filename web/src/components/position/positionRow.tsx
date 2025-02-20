import Link from "next/link";
import config from "@/config";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";

export default function PositionRow({
  data,
  price,
}: {
  data: {
    shareAddress: `0x${string}`;
    name: string;
    balance: string;
    campaignName?: string;
    outcomePic?: string;
  };
  price?: string;
}) {
  return (
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
      <td className="flex justify-end px-2">
        {/* <a
          href={`https://long.so/stake/pool?id=${data.shareAddress}`}
          target="_blank"
          rel="noopener,noreferrer"
        >
          <Button title="LP" />
        </a> */}
      </td>
    </tr>
  );
}
