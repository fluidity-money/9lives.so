"use client";
import useAchievements from "@/hooks/useAchievements";
import RetroCard from "../cardRetro";
import AchievementItem from "./achievementItem";
export default function AchievementGrid() {
  const { data } = useAchievements();
  return (
    <RetroCard title="All Achievements" padding="p-7">
      <div className="grid grid-cols-3 gap-7">
        {data?.map((item, idx) => (
          <AchievementItem data={item} key={item.id} />
        ))}
      </div>
    </RetroCard>
  );
}
