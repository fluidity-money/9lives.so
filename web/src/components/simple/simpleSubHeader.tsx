import useCountdown from "@/hooks/useCountdown";
import { HeaderBox } from "../detail/detailHeaderBox";

export default function SimpleSubHeader({
  basePrice,
  ending,
  latestPrice,
}: {
  basePrice: number;
  ending: number;
  latestPrice?: number;
}) {
  const timeleft = useCountdown(ending);
  const subHeaderMap = [
    {
      title: "Base Price",
      value: `$${basePrice}`,
      show: true,
    },
    {
      title: "Current Price",
      value: `$${latestPrice}`,
      show: true,
    },
    {
      title: "Ends In",
      value: `${timeleft}`,
      show: true,
    },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {subHeaderMap
        .filter((i) => i.show)
        .map((i) => (
          <HeaderBox key={i.title} title={i.title} value={i.value} />
        ))}
    </div>
  );
}
