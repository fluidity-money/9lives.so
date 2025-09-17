import { combineClass } from "@/utils/combineClass";

export default function Placeholder({
  height,
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  height?: string;
}) {
  return (
    <div
      className={combineClass(
        "flex flex-col items-center justify-center gap-1",
        height,
      )}
    >
      <span className="font-chicago text-xs">{title}</span>
      <span className="font-geneva text-[10px] uppercase text-[#808080]">
        {subtitle}
      </span>
    </div>
  );
}
