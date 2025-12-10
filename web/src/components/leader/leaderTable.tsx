import { combineClass } from "@/utils/combineClass";
import React from "react";
import LeaderRow from "./leaderRow";
import { useActiveAccount } from "thirdweb/react";
import { Leader } from "@/types";

export default function LeaderTable({ data }: { data?: Leader[] }) {
  const titles = [
    "Rank",
    "User",
    "Points",
    //, "Profit"
  ];
  const account = useActiveAccount();
  const accountInTheList = data?.find(
    (i) => i.wallet.toLowerCase() === account?.address.toLowerCase(),
  );
  const accountIndex = data?.findIndex(
    (i) => i.wallet.toLowerCase() === account?.address.toLowerCase(),
  );
  return (
    <table className="w-full border-separate border-spacing-0 overflow-auto">
      <thead className="sticky top-0 bg-9layer">
        <tr>
          {titles.map((title, index) => (
            <th
              key={index}
              className={combineClass(
                index === 0 && "py-3",
                "border-y border-y-gray-200 text-left font-chicago text-xs font-normal uppercase text-gray-400",
              )}
            >
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="w-full">
        {account?.address ? (
          accountInTheList ? (
            <LeaderRow
              data={{
                wallet: accountInTheList.wallet,
                amount: accountInTheList.amount,
              }}
              ranking={accountIndex ? accountIndex + 1 : undefined}
              highlightUser
            />
          ) : null
        ) : (
          <LeaderRow />
        )}
        {data?.map((item, idx) => (
          <LeaderRow key={item.wallet} data={item} ranking={idx + 1} />
        ))}
      </tbody>
    </table>
  );
}
