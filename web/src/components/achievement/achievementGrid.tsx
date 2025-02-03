"use client";
import useAchievements from "@/hooks/useAchievements";
import RetroCard from "../cardRetro";
import AchievementItem from "./achievementItem";
import { useQuery } from "@tanstack/react-query";
import React, { forwardRef } from "react";
import { combineClass } from "@/utils/combineClass";

const AchievementGrid = forwardRef<
  HTMLDivElement,
  { isDegenModeEnabled: boolean }
>(function AchievementGrid(props, ref) {
  const { data } = useAchievements();
  const { data: totalUserCount } = useQuery<number>({
    queryKey: ["totalUserCount"],
  });

  return (
    <div ref={ref}>
      <RetroCard title="All Achievements" padding="p-7" className="p-3 md:p-7">
        <div
          className={combineClass(
            "grid gap-3 md:gap-7",
            props.isDegenModeEnabled ? "md:grid-cols-2" : "md:grid-cols-3",
          )}
        >
          {data?.map((item) => (
            <AchievementItem
              data={item}
              key={item.id}
              totalUserCount={totalUserCount}
              displayUserOwned={true}
            />
          ))}
        </div>
      </RetroCard>
    </div>
  );
});

export default AchievementGrid;
