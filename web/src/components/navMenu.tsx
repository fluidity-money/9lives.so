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
    },
    {
      title: "Leaderboard",
      page: "/leaderboard",
    },
  ];

  return (
    <nav className="flex h-10 flex-1 items-center justify-center gap-4 border-x-2 border-x-black">
      {menu.map((item) => (
        <Link
          key={item.page}
          href={item.page}
          className="font-chicago text-neutral-800 hover:underline"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
