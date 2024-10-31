import { combineClass } from "@/utils/combineClass";
import React from "react";
import { Leader } from "@/types";
import LeaderRow from "./leaderRow";

const mockData = Array.from({ length: 10 }, () => ({
  rank: (Math.random() * 9 + 1).toFixed(0),
  user: "0x544654563242af123",
  positions: (Math.random() * 100).toFixed(0),
  profit: `${Math.random() * 1000}$`,
})) as Leader[];
export default function LeaderTable() {
  const titles = ["Rank", "User", "Positions", "Profit"];
  return (
    <table className="w-full border-separate border-spacing-0">
      <thead>
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
      <tbody>
        {mockData.map((item) => (
          <LeaderRow key={item.user} data={item} />
        ))}
      </tbody>
    </table>
  );
}
