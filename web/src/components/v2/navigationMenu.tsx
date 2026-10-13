"use client";

import useFeatureFlag from "@/hooks/useFeatureFlag";
import Link from "next/link";

export default function NavigationMenu() {
  const enableRfqhub = useFeatureFlag("feature enable rfqhub in navbar");
  const routes = [
    {
      name: "Trade",
      path: "/",
    },
    {
      name: "Portfolio",
      path: "/portfolio",
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
    },
    ...(enableRfqhub
      ? [
          {
            name: "RFQ",
            path: "/rfqhub",
          },
        ]
      : []),
  ];

  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-4">
        {routes.map((route) => (
          <li key={route.path}>
            <Link className="text-sm text-2black" href={route.path}>
              {route.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
