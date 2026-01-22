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
    <div className="flex items-center justify-center rounded-lg bg-green-100 px-1 py-3 shadow-[inset_1px_1px_2px_0px_rgba(34,197,94,0.50)]">
      <span className="text-sm font-medium text-2black">
        💎 Earn{" "}
        <span className="text-green-600">
          +{(usdValue! * points).toFixed(2)}
        </span>{" "}
        9Lives Points 💎
      </span>
    </div>
  );
}
