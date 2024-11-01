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
          <span className="font-geneva text-[10px] uppercase text-[#808080]">
            {data.shareAddress}
          </span>
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
          href={`https://app.camelot.exchange/liquidity/?token1=${data.shareAddress}&token2=0x4CFA50B7Ce747e2D61724fcAc57f24B748FF2b2A`}
          target="_blank"
          rel="noopener,noreferrer"
        >
          <Button title="LP" />
        </a>
      </td>
    </tr>
  );
}
