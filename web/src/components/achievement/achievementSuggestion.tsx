import RetroCard from "../cardRetro";
import AchievementItem from "./achievementItem";
const achs = Array.from({ length: 5 });
export default function AchievementSuggestion() {
  return (
    <RetroCard title="Get started here" position="middle">
      <div className="flex flex-col gap-4">
        {achs.map((_, idx) => (
          <AchievementItem key={idx} />
        ))}
      </div>
    </RetroCard>
  );
}
