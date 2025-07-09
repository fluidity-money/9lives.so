"use client";
import useAchievements from "@/hooks/useAchievements";
import RetroCard from "../cardRetro";
import AchievementItem from "./achievementItem";
import { useQuery } from "@tanstack/react-query";

export default function AchievementSuggestion() {
  const { data } = useAchievements();
  const { data: totalUserCount } = useQuery<number>({
    queryKey: ["totalUserCount"],
  });
  return (
    <RetroCard title="Get started here" position="middle">
      <div className="flex flex-col gap-4">
        {data?.slice(0, 4).map((item) => (
          <AchievementItem
            data={item}
            key={item.id}
            totalUserCount={totalUserCount}
          />
        ))}
      </div>
    </RetroCard>
  );
}
