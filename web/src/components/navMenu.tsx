import { combineClass } from "@/utils/combineClass";
import Link from "next/link";
export default function NavigationMenu() {
  const menu = [
    {
      title: "Markets",
      page: "/",
    },
    {
      title: "Leaderboard",
      page: "/leaderboard",
    },
  ];

  return (
    <nav className="flex flex-1 flex-col items-center justify-center gap-4 md:flex-row">
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
