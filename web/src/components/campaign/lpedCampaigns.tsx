import { useActiveAccount } from "thirdweb/react";
import Placeholder from "../tablePlaceholder";
import useUserLPs from "@/hooks/useUserLPs";
import Image from "next/image";
import formatFusdc from "@/utils/formatFusdc";
import Link from "next/link";

export default function UserLpedCampaignsList() {
  const headerItems = ["Campaign", "Provided Liquidity", "Actions"];
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const bodyStyles = "min-h-24 bg-9gray";
  const account = useActiveAccount();
  const { data: campaigns, isLoading } = useUserLPs(account?.address);
  return (
    <table className="w-full table-auto border-separate border-spacing-y-1">
      <thead>
        <tr className="font-geneva">
          {headerItems.map((key) => (
            <th className={tableHeaderClasses} key={key}>
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={bodyStyles}>
        {isLoading ? (
          <Placeholder title="Loading.." colSpan={headerItems.length} />
        ) : campaigns?.length === 0 ? (
          <Placeholder
            title="Nothing yet."
            subtitle="Start Growing Your Portfolio."
            colSpan={headerItems.length}
          />
        ) : (
          campaigns?.map(({ campaign: data, liquidity }) => (
            <tr key={data?.identifier}>
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
          ))
        )}
      </tbody>
    </table>
  );
}
