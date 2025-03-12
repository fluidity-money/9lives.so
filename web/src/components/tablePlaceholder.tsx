import { combineClass } from "@/utils/combineClass";
export default function Placeholder({
  title,
  subtitle,
  colSpan = 5,
  height = "min-h-36",
}: {
  title: string;
  subtitle?: string;
  colSpan?: number;
  height?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
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
      </td>
    </tr>
  );
}
