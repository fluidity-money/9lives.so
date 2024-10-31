import RetroCard from "../cardRetro";
import AchievementItem from "./achievementItem";
export default function AchievementGrid() {
  const achs = Array.from({ length: 10 });
  return (
    <RetroCard title="All Achievements" padding="p-7">
      <div className="grid grid-cols-3 gap-7">
        {achs.map((_, idx) => (
          <AchievementItem key={idx + "_grid"} />
        ))}
      </div>
    </RetroCard>
  );
}
