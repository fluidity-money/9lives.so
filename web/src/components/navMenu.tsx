import { combineClass } from "@/utils/combineClass";
import Link from "next/link";
import PointMenuButton from "./pointsMenuButton";
export default function NavigationMenu({
  simple = false,
}: {
  simple?: boolean;
}) {
  const menu = [
    {
      title: "Markets",
      page: simple ? "/simple/campaign/btc" : "/",
    },
    // {
    //   title: "Leaderboard",
    //   page: "/leaderboard",
    // },
    {
      title: "Portfolio",
      page: "/portfolio",
    },
  ] as { disabled?: boolean; title: string; page: string }[];

  return (
    <nav className="flex flex-1 flex-col items-center justify-center gap-4 md:flex-row">
      {menu.map((item) => (
        <Link
          key={item.page}
          href={item.page}
          className={combineClass(
            "font-chicago text-neutral-800 transition-colors hover:underline dark:text-9gray",
            item.disabled && "pointer-events-none opacity-30",
          )}
        >
          {item.title}
        </Link>
      ))}
      <PointMenuButton />
    </nav>
  );
}
