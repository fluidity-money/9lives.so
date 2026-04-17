"use client";

import type { MockActivity } from "./mockData";
import { combineClass } from "@/utils/combineClass";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ActivityCard({ a }: { a: MockActivity }) {
  return (
    <div className="flex items-center gap-[12px] py-[10px] px-[12px] hover:bg-[#fafafa] rounded-[8px] transition-colors">
      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
        <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e] truncate">
          {a.campaignName}
        </span>
        <div className="flex items-center gap-[6px]">
          <span className={combineClass(
            "font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px] shrink-0",
            a.outcomeName === "Up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
          )}>
            {a.outcomeName}
          </span>
          <span className="font-dmMono text-[9px] text-[#a3a3a3] truncate">
            {a.txHash.slice(0, 8)}...{a.txHash.slice(-4)}
          </span>
        </div>
      </div>
      <span className={combineClass(
        "font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px] shrink-0",
        a.type === "buy" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
      )}>
        {a.type}
      </span>
      <div className="flex flex-col items-end gap-[2px] shrink-0">
        <span className="font-dmMono text-[13px] text-[#0e0e0e]">${a.price.toFixed(2)}</span>
        <span className="font-dmMono text-[9px] text-[#a3a3a3]">price</span>
      </div>
      <div className="flex flex-col items-end gap-[2px] shrink-0">
        <span className={combineClass("font-dmMono text-[13px]", a.type === "buy" ? "text-[#16a34a]" : "text-[#dc2626]")}>
          {a.type === "buy" ? "+" : "-"}{a.qty.toLocaleString()}
        </span>
        <span className="font-dmMono text-[9px] text-[#a3a3a3]">qty</span>
      </div>
      <div className="flex flex-col items-end gap-[2px] shrink-0">
        <span className="font-dmMono text-[13px] text-[#0e0e0e]">${a.cost.toFixed(2)}</span>
        <span className="font-dmMono text-[9px] text-[#a3a3a3]">cost</span>
      </div>
      <span className="font-dmMono text-[11px] text-[#a3a3a3] shrink-0 w-[50px] text-right">
        {timeAgo(a.timestamp)}
      </span>
    </div>
  );
}

export default function MockActivityTab({ activities }: { activities: MockActivity[] }) {
  if (activities.length === 0) {
    return (
      <div className="relative bg-[#fdfdfd] rounded-[12px] w-full">
        <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
        <div className="flex flex-col items-center justify-center py-[48px] gap-[8px] relative">
          <span className="font-overusedGrotesk font-semibold text-[16px] text-[#0e0e0e]">No activity yet.</span>
          <span className="font-dmMono text-[11px] text-[#a3a3a3] uppercase tracking-[0.22px]">Start trading to see your history.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#fdfdfd] rounded-[12px] w-full">
      <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col divide-y divide-[#f0f0f0] p-[8px] relative">
        {activities.map((a, i) => <ActivityCard key={i} a={a} />)}
      </div>
    </div>
  );
}
