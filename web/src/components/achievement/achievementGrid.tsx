"use client";
import useAchievements from "@/hooks/useAchievements";
import RetroCard from "../cardRetro";
import AchievementItem from "./achievementItem";
import { useQuery } from "@tanstack/react-query";
export default function AchievementGrid() {
  const { data } = useAchievements();
  const { data: totalUserCount } = useQuery<number>({
    queryKey: ["totalUserCount"],
  });
  return (
    <RetroCard title="All Achievements" padding="p-7" className="p-3 md:p-7">
      <div className="grid gap-3 md:grid-cols-3 md:gap-7">
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
  );
}
