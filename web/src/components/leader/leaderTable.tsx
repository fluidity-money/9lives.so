import { combineClass } from "@/utils/combineClass";
import React from "react";
import LeaderRow from "./leaderRow";
import useLeaderboard from "@/hooks/useLeaderboard";

export default function LeaderTable() {
  const titles = ["Rank", "User", "Score", "Profit"];
  const { data } = useLeaderboard();
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
        {data?.map((item) => <LeaderRow key={item.wallet} data={item} />)}
      </tbody>
    </table>
  );
}
