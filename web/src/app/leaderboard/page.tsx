import AchievementGrid from "@/components/achievement/achievementGrid";
import AchievementSuggestion from "@/components/achievement/achievementSuggestion";
import LeaderTabScene from "@/components/leader/leaderTabScene";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <h2 className="font-chicago text-2xl">Leaderboard</h2>
      <div className="flex flex-col gap-10 md:flex-row">
        <div className="flex-[2]">
          <LeaderTabScene />
        </div>
        <div className="flex-1">
          <AchievementSuggestion />
        </div>
      </div>
      <AchievementGrid />
    </div>
  );
}
