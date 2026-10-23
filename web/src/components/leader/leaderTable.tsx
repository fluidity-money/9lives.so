"use client";

import use9LivesPoints from "@/hooks/use9LivesPoints";
import { useAppKitAccount } from "@reown/appkit/react";
import LeaderRow from "./leaderRow";

const columns = ["Rank", "Trader", "Points", "PnL", "Volume"];

export default function LeaderTable() {
  const { data, isLoading, isError } = use9LivesPoints({});
  const account = useAppKitAccount();
  const accountAddress = account.address?.toLowerCase();
  const accountInTheList = data?.find(
    (item) => item.wallet.toLowerCase() === accountAddress,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-2black">Global rankings</h2>
          <p className="text-xs text-neutral-400">All-time performance</p>
        </div>
        <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
          Top {data?.length ?? 50}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-200">
              {columns.map((column, index) => (
                <th
                  key={column}
                  className={`px-4 py-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase ${
                    index < 2 ? "text-left" : "text-right"
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!accountAddress ? <LeaderRow /> : null}
            {accountInTheList ? (
              <LeaderRow data={accountInTheList} highlightUser />
            ) : null}

            {isLoading
              ? Array.from({ length: 6 }, (_, index) => (
                  <tr
                    key={index}
                    className="border-b border-neutral-200 last:border-0"
                  >
                    <td colSpan={columns.length} className="px-4 py-2">
                      <div className="skeleton h-11 w-full" />
                    </td>
                  </tr>
                ))
              : null}

            {isError ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-neutral-500"
                >
                  The leaderboard could not be loaded. Please try again.
                </td>
              </tr>
            ) : null}

            {!isLoading && !isError
              ? data
                  ?.filter(
                    (item) => item.wallet.toLowerCase() !== accountAddress,
                  )
                  .map((item) => <LeaderRow key={item.wallet} data={item} />)
              : null}

            {!isLoading && !isError && data?.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-neutral-500"
                >
                  No rankings yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
