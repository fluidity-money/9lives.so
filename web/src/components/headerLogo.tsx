import svgPaths from "./v2/leaderboard/svgPaths";

export default function HeaderLogo() {
  return (
    <div className="h-[18px] relative shrink-0 w-[75px]">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 75 18"
      >
        <g>
          <path d={svgPaths.p2d702af0} fill="#A3A3A3" />
          <path d={svgPaths.p33610200} fill="#A3A3A3" />
          <path d={svgPaths.p3d27f300} fill="#A3A3A3" />
          <path d={svgPaths.pe517500} fill="#A3A3A3" />
          <path d={svgPaths.p1317100} fill="#A3A3A3" />
          <path d={svgPaths.p129a6f80} fill="#A3A3A3" />
          <path d={svgPaths.p26ce4e80} fill="#A3A3A3" />
        </g>
      </svg>
    </div>
  );
}
