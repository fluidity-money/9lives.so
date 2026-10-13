import ConnectButton from "./connectButton";
import Link from "next/link";
import HeaderLogo from "../headerLogo";
import SimpleClaimAllButton from "./claimAllButton";
import ReferralButton from "./referralButton";
import NavigationMenu from "./navigationMenu";

export default function Header() {
  return (
    <div className="flex items-center justify-between p-2 md:p-4">
      <div className="flex items-center">
        <Link
          data-test="header-logo"
          href="/"
          className="night-theme-logo flex h-10 items-center justify-center px-0 md:px-4"
        >
          <HeaderLogo />
        </Link>
        <NavigationMenu />
      </div>
      <div className="flex items-center gap-2">
        <SimpleClaimAllButton shouldHideOnMobile />
        <ReferralButton shouldHideOnMobile />
        <ConnectButton />
      </div>
    </div>
  );
}
