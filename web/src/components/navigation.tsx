import Link from "next/link";
export default function Navigation() {
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
    <nav className="flex items-center gap-4">
      {menu.map((item) => (
        <Link key={item.page} href={item.page}>
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
