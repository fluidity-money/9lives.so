import ShadowCard from "@/components/cardShadow";
import AchYellow from "#/icons/ach-y.svg";
import Image from "next/image";
import CatImage from "#/images/cat.png";
import { Achievement } from "@/types";
export default function AchievementItem({
  data,
  totalUserCount,
}: {
  data: Achievement;
  totalUserCount?: number;
}) {
  return (
    <ShadowCard className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2.5">
          <Image src={AchYellow} width={45} alt="Achievement" />
          <div className="flex flex-col gap-1">
            <span className="font-chicago text-sm">{data.name}</span>
            <span className="text-xs">{data.description}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <Image
            src={CatImage}
            width={24}
            height={24}
            alt=""
            className="border border-9black"
          />
          <div className="flex size-6 items-center justify-center border border-9black bg-9blueDark font-chicago text-xs">
            5+
          </div>
        </div>
      </div>
      <p className="text-center font-geneva text-[10px] uppercase text-[#808080]">
        {!data.shouldCountMatter && totalUserCount
          ? `${((data.count / totalUserCount) * 100).toFixed(0)}`
          : "?"}
        % users have this achievement
      </p>
    </ShadowCard>
  );
}
