"use client";
import AchievementGrid from "@/components/achievement/achievementGrid";
import AchievementSuggestion from "@/components/achievement/achievementSuggestion";
import LeaderTabScene from "@/components/leader/leaderTabScene";
import { useDegenStore } from "@/stores/degenStore";
import { combineClass } from "@/utils/combineClass";
import { useRef } from "react";

export default function LeaderboardPage() {
  const achievementsRef = useRef<HTMLDivElement>(null);
  const isDegenModeEnabled = useDegenStore((s) => s.degenModeEnabled);

  const scrollToAchievments = () => {
    achievementsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  return (
    <div className="flex flex-1 flex-col gap-5">
      <h2 className="font-chicago text-2xl">Leaderboard</h2>
      <div
        className={combineClass(
          "flex flex-col gap-10",
          isDegenModeEnabled ? "xl:flex-row" : "md:flex-row",
        )}
      >
        <div
          className={combineClass(
            "relative flex-[2]",
            isDegenModeEnabled
              ? "xl:overflow-y-scroll"
              : "md:overflow-y-scroll",
          )}
        >
          <LeaderTabScene
            isDegenModeEnabled={isDegenModeEnabled}
            scrollToAchievments={scrollToAchievments}
          />
        </div>
        <div className="flex-1">
          <AchievementSuggestion />
        </div>
      </div>
      <AchievementGrid
        ref={achievementsRef}
        isDegenModeEnabled={isDegenModeEnabled}
      />
    </div>
  );
}
