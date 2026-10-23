import LeaderTable from "@/components/leader/leaderTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | 9lives",
  description: "See the leading traders on 9lives.",
};

export default function LeaderboardPage() {
  return (
    <section className="flex flex-col gap-5 py-4 md:py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-neutral-400 uppercase">
          Rankings
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-2black">
          Leaderboard
        </h1>
        <p className="max-w-md text-sm text-neutral-500">
          The top traders ranked by points, with all-time profit and volume.
        </p>
      </div>
      <LeaderTable />
    </section>
  );
}
