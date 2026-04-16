"use client";

import { STATES } from "./demoData";

const labels = ["Base (Figma)", "Day 1", "Day 2", "Day 3", "Day 4", "Day 5 ✓", "Full Week", "Lost Streak"];

export default function ProgressionController({
  level,
  setLevel,
}: {
  level: number;
  setLevel: (l: number) => void;
}) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-[60px] right-[16px] z-50 bg-[#0e0e0e] text-[#fdfdfd] rounded-[12px] p-[12px] flex flex-col gap-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-[8px]">
        <span className="font-dmMono font-medium text-[9px] uppercase tracking-[0.18px] text-[#a3a3a3]">
          Progression
        </span>
        <span className="font-overusedGrotesk font-semibold text-[12px]">{labels[level]}</span>
      </div>
      <div className="flex gap-[4px]">
        {STATES.map((_, i) => (
          <button
            key={i}
            className={`size-[28px] rounded-[6px] font-dmMono font-medium text-[11px] cursor-pointer transition-colors ${
              level === i
                ? "bg-[#fdfdfd] text-[#0e0e0e]"
                : "bg-[#333] text-[#a3a3a3] hover:bg-[#444]"
            }`}
            onClick={() => setLevel(i)}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
