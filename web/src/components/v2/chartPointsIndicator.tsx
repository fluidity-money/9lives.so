import usePointsForDppmMint from "@/hooks/usePointsForDppmMint";

type DefaultProps = {
  starting: number;
  ending: number;
  x1: number;
  y1: number;
  x2: number;
};

type Props = DefaultProps;

export default function ChartPointsIndicator({
  x1,
  y1,
  x2,
  starting,
  ending,
}: Props) {
  const points = usePointsForDppmMint(starting, ending);

  if (!points) return null;
  const cx = (x1 + x2) / 2;
  return (
    <g>
      <rect
        x={cx - 55}
        y={y1 + 23}
        width={110}
        height={15}
        fill="#F3E8FF"
        rx={10}
        stroke="#C084FC"
        strokeWidth={1}
      />
      <text
        x={cx + 0}
        y={y1 + 34}
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#C084FC"
      >
        EARN x{points.toFixed(2)} POINTS
      </text>
    </g>
  );
}
