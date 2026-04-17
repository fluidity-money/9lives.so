"use client";

import { useState } from "react";
import type { MockPosition } from "./mockData";
import { combineClass } from "@/utils/combineClass";
import Button from "../button";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function HistoryRow({ h }: { h: MockPosition["outcomes"][0]["history"][0] }) {
  return (
    <div className="flex items-center gap-[12px] py-[6px] px-[8px] text-[13px]">
      <span className={combineClass(
        "font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px]",
        h.type === "buy" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
      )}>
        {h.type}
      </span>
      <span className="font-dmMono text-[#0e0e0e] text-[13px]">${h.price.toFixed(2)}</span>
      <span className={combineClass("font-dmMono text-[13px]", h.type === "buy" ? "text-[#16a34a]" : "text-[#dc2626]")}>
        {h.type === "buy" ? "+" : "-"}{h.qty.toLocaleString()}
      </span>
      <span className="font-dmMono text-[#0e0e0e] text-[13px]">${h.cost.toFixed(2)}</span>
      <span className="font-dmMono text-[#a3a3a3] text-[11px] ml-auto">{timeAgo(h.timestamp)}</span>
    </div>
  );
}

function OutcomeRow({ o, isEnded }: { o: MockPosition["outcomes"][0]; isEnded: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const value = Number(o.balance) * o.currentPrice;

  return (
    <div>
      <div
        className="flex items-center gap-[12px] py-[10px] px-[8px] hover:bg-[#fafafa] rounded-[8px] transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={combineClass(
          "font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px] shrink-0",
          o.name === "Up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
        )}>
          {o.name}
        </span>
        <div className="flex-1 grid grid-cols-4 gap-[8px]">
          <div className="flex flex-col">
            <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">Price</span>
            <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">${o.currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">Qty</span>
            <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">{Number(o.balance).toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">Value</span>
            <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">${value.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">PnL</span>
            <span className={combineClass(
              "font-overusedGrotesk font-semibold text-[14px]",
              o.pnl >= 0 ? "text-[#16a34a]" : "text-[#dc2626]",
            )}>
              {o.pnl >= 0 ? "+" : ""}${o.pnl.toFixed(2)} ({o.pnlPct >= 0 ? "+" : ""}{o.pnlPct.toFixed(1)}%)
            </span>
          </div>
        </div>
        <svg className={`size-[16px] shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 16 16">
          <path d="M4 6L8 10L12 6" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {o.isWinner && (
        <div className="flex items-center gap-[8px] px-[8px] py-[8px]">
          <div className="flex-1 bg-[#fefce8] rounded-[8px] px-[12px] py-[8px] font-overusedGrotesk font-semibold text-[14px] text-[#a16207]">
            🎉 Reward: ${o.toWin.toFixed(2)}
          </div>
          <Button intent="reward" title="Claim Reward" size="small" />
        </div>
      )}

      {expanded && o.history.length > 0 && (
        <div className="bg-[#fafafa] rounded-[8px] mx-[8px] mb-[8px] divide-y divide-[#e5e5e5]">
          {o.history.map((h, i) => <HistoryRow key={i} h={h} />)}
        </div>
      )}
    </div>
  );
}

function PositionCard({ p }: { p: MockPosition }) {
  return (
    <div className="relative bg-[#fdfdfd] rounded-[12px] w-full">
      <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col gap-[8px] p-[16px] relative">
        {/* Campaign header */}
        <div className="flex items-center gap-[8px] flex-wrap">
          <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
            {p.campaignName}
          </span>
          {p.isEnded && (
            <span className="font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px] bg-[#fafafa] text-[#a3a3a3]">
              Concluded
            </span>
          )}
          {p.winner && p.outcomes.some(o => o.isWinner) && (
            <span className="font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px] bg-green-50 text-green-600">
              Winner
            </span>
          )}
          {p.isEnded && !p.outcomes.some(o => o.isWinner) && (
            <span className="font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px] bg-red-50 text-red-600">
              Lost
            </span>
          )}
        </div>
        {/* Outcomes */}
        <div className="flex flex-col divide-y divide-[#f0f0f0]">
          {p.outcomes.map(o => <OutcomeRow key={o.id} o={o} isEnded={p.isEnded} />)}
        </div>
      </div>
    </div>
  );
}

export default function MockPositionsTab({ positions }: { positions: MockPosition[] }) {
  const [hideSmall, setHideSmall] = useState(false);

  if (positions.length === 0) {
    return (
      <div className="relative bg-[#fdfdfd] rounded-[12px] w-full">
        <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
        <div className="flex flex-col items-center justify-center py-[48px] gap-[8px] relative">
          <span className="font-overusedGrotesk font-semibold text-[16px] text-[#0e0e0e]">Nothing yet.</span>
          <span className="font-dmMono text-[11px] text-[#a3a3a3] uppercase tracking-[0.22px]">Start Growing Your Portfolio.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <span className="font-dmMono text-[11px] uppercase text-[#a3a3a3] tracking-[0.22px]">
          {positions.length} campaign(s)
        </span>
        <label className="flex items-center gap-[6px] cursor-pointer">
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3] tracking-[0.18px]">Hide Small Balances</span>
          <input type="checkbox" checked={hideSmall} onChange={() => setHideSmall(!hideSmall)} className="size-[14px]" />
        </label>
      </div>
      {positions.map((p, i) => <PositionCard key={i} p={p} />)}
    </div>
  );
}
