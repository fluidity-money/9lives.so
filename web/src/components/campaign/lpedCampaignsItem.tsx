import formatFusdc from "@/utils/formatFusdc";
import Image from "next/image";
import Link from "next/link";

export default function UserLpedCampaignsListItem({
  data,
  liquidity,
}: {
  data: {
    identifier: string;
    picture: string | null;
    name: string;
    winner: string | null;
  } | null;
  liquidity: string | null;
}) {
  return (
    <tr>
      <td className="bg-[#DDDDDD] align-baseline">
        <Link href={`/campaign/${data?.identifier}`}>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              {data?.picture ? (
                <Image
                  src={data?.picture}
                  alt={data.name}
                  width={40}
                  height={40}
                  className="size-10 self-start border border-9black bg-9layer"
                />
              ) : null}
              <div className="flex flex-row gap-1">
                <p
                  className={
                    "self-start bg-9layer px-1 py-0.5 font-geneva text-xs uppercase tracking-wide text-9black"
                  }
                >
                  {data?.name}
                </p>
                {data?.winner ? (
                  <span className="bg-9yellow p-0.5 font-geneva text-[10px] uppercase tracking-wide">
                    Concluded
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Link>
      </td>
      <td className="pl-2">
        <span className="font-chicago text-xs">
          ${formatFusdc(liquidity ?? "0", 2)}
        </span>
      </td>
      <td></td>
    </tr>
  );
}
