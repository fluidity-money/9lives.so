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
    <div className="flex shrink-0 items-center">
      <span
        className={combineClass(
          "bg-9green",
          variant === "default"
            ? "mx-auto px-2 py-1 font-chicago text-sm uppercase"
            : "px-1 py-0.5",
        )}
      >
        EARN{" "}
        {variant === "only_multiplier"
          ? `x${points.toFixed(2)}`
          : `${(usdValue! * points).toFixed(2)} 9lives`}{" "}
        POINTS
      </span>
    </div>
  );
}
