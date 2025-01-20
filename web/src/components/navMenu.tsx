import { combineClass } from "@/utils/combineClass";
import Link from "next/link";
export default function NavigationMenu() {
  const menu = [
    {
      title: "Markets",
      page: "/",
    },
    {
      title: "Portfolio",
      page: "/portfolio",
      disabled: true,
    },
    {
      title: "Leaderboard",
      page: "/leaderboard",
    },
    {
      title: "Staking",
      page: "/staking",
      disabled: true,
    },
    {
      title: "AI Agents",
      page: "/ai-agents",
      disabled: true,
    },
  ];

  return (
    <nav className="hidden h-10 flex-1 items-center justify-center gap-4 border-x-2 border-x-black md:flex">
      {menu.map((item) => (
        <Link
          key={item.page}
          href={item.page}
          className={combineClass(
            "font-chicago text-neutral-800 hover:underline",
            item.disabled && "pointer-events-none opacity-30",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
