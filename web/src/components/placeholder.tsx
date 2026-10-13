import { combineClass } from "@/utils/combineClass";

export default function Placeholder({
  height,
  title,
  subtitle,
  modern = false,
}: {
  title: string;
  subtitle?: string;
  height?: string;
  modern?: boolean;
}) {
  return (
    <div
      className={combineClass(
        "flex flex-col items-center justify-center gap-1",
        height,
      )}
    >
      <span
        className={
          modern ? "text-sm font-medium text-2black" : "font-chicago text-xs"
        }
      >
        {title}
      </span>
      <span
        className={
          modern
            ? "text-xs text-neutral-400"
            : "font-geneva text-[10px] uppercase text-[#808080]"
        }
      >
        {subtitle}
      </span>
    </div>
  );
}
