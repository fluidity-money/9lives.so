import Link from "next/link";
import Button from "../themed/button";
import config from "@/config";

export default function PositionRow({
  data,
  price,
}: {
  data: { shareAddress: `0x${string}`; name: string; balance: string };
  price?: string;
}) {
  return (
    <tr>
      <td>
        <div className="flex flex-col gap-1 p-1">
          <p className="font-chicago text-xs">{data.name}</p>
          <Link
            href={`https://arbiscan.io/token/${data.shareAddress}`}
            target="_blank"
          >
            <span className="font-geneva text-[10px] uppercase text-[#808080] underline">
              {data.shareAddress.slice(0, 4)}...{data.shareAddress.slice(-4)}
            </span>
          </Link>
        </div>
      </td>
      <td>
        <span className="font-chicago text-xs">$ {data.balance}</span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          ${" "}
          {price
            ? (Number(data.balance) * Number(price)).toFixed(
                config.contracts.decimals.fusdc,
              )
            : ""}
        </span>
      </td>
      <td className="flex justify-end px-2">
        <a
          href={`https://long.so/stake/pool?id=${data.shareAddress}`}
          target="_blank"
          rel="noopener,noreferrer"
        >
          <Button title="LP" />
        </a>
      </td>
    </tr>
  );
}
