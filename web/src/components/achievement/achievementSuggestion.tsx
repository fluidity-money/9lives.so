"use client";
import useAchievements from "@/hooks/useAchievements";
import RetroCard from "../cardRetro";
import AchievementItem from "./achievementItem";

export default function AchievementSuggestion() {
  const { data } = useAchievements();
  return (
    <RetroCard title="Get started here" position="middle">
      <div className="flex flex-col gap-4">
        {data?.map((item) => <AchievementItem data={item} key={item.id} />)}
      </div>
    </RetroCard>
  );
}
