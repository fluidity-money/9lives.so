import { HeaderBox } from "../detail/detailHeaderBox";

export default function SimpleSubHeader({
  basePrice,
  latestPrice,
  isEnded,
}: {
  basePrice: number;
  latestPrice?: number;
  isEnded: boolean;
}) {
  const subHeaderMap = [
    {
      title: "Base Price",
      value: `$${basePrice}`,
      show: true,
    },
    {
      title: isEnded ? "Final Price" : "Current Price",
      value: `$${latestPrice}`,
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
