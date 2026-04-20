import svgPaths from "./svgPaths";

export function PnlIcon({ positive = true }: { positive?: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-center overflow-clip p-[2px] size-[18px]">
      <svg
        className={`size-full transition-transform ${positive ? "" : "rotate-180"}`}
        fill="none"
        viewBox="0 0 10 5.45469"
      >
        <path d={svgPaths.p14ca1b00} fill={positive ? "#16A34A" : "#DC2626"} />
      </svg>
    </div>
  );
}

export function GlobeIcon({ active }: { active: boolean }) {
  const fill = active ? "#2563EB" : "#A3A3A3";
  return (
    <svg className="size-[12px] shrink-0" fill="none" viewBox="0 0 12 12">
      <path d={svgPaths.p36a29400} fill={fill} />
      <path d={svgPaths.p2f4c4000} fill={fill} />
      <path d={svgPaths.p29adf2f0} fill={fill} />
    </svg>
  );
}

export function FriendsIcon({ active }: { active: boolean }) {
  const fill = active ? "#2563EB" : "#A3A3A3";
  return (
    <svg className="h-[12px] w-[14px] shrink-0" fill="none" viewBox="0 0 14 12">
      <path d={svgPaths.p1fa347f0} fill={fill} />
      <path d={svgPaths.p1f650100} fill={fill} />
    </svg>
  );
}
