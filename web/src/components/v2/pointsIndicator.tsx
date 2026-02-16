import usePointsForDppmMint from "@/hooks/usePointsForDppmMint";
import { combineClass } from "@/utils/combineClass";

type DefaultProps = {
  variant?: "default";
  usdValue: number;
  starting: number;
  ending: number;
};

type OnlyMultiplierProps = {
  variant: "only_multiplier";
  usdValue?: never;
  starting: number;
  ending: number;
};

type Props = DefaultProps | OnlyMultiplierProps;

export default function PointsIndicator({
  usdValue,
  starting,
  ending,
  variant = "default",
}: Props) {
  const points = usePointsForDppmMint(starting, ending);

  if (!points || (variant === "default" && !usdValue)) return null;

  return (
    <div className="flex items-center justify-center rounded-lg border border-purple-600 bg-purple-200 px-1 py-3">
      <span className="text-sm font-bold text-purple-600">
        💎 Earn +{(usdValue! * points).toFixed(2)} 9Lives Points 💎
      </span>
    </div>
  );
}
