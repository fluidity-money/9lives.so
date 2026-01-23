import Button from "./button";
import ConnectButton from "./connectButton";
import Link from "next/link";
import HeaderLogo from "../headerLogo";
import SimpleClaimAllButton from "./claimAllButton";
import ReferralButton from "./referralButton";

function Menu() {
  const routes = [
    {
      name: "Marketplace",
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
  ];
  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-4">
        {routes.map((r) => (
          <li key={r.path}>
            <Link className="text-sm text-2black" href={r.path}>
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Header() {
  return (
    <div className="flex items-center justify-between p-2 md:p-4">
      <div className="flex items-center">
        <Link
          data-test="header-logo"
          href="/"
          className="flex h-10 items-center justify-center px-0 md:px-4"
        >
          <HeaderLogo />
        </Link>
        <Menu />
      </div>
      <div className="flex items-center gap-2">
        <SimpleClaimAllButton />
        <ReferralButton />
        <ConnectButton />
      </div>
    </div>
  );
}
