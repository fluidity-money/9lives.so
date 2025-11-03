"use client";

import ConnectButton from "@/components/connectButton";
import NavigationMenu from "@/components/navMenu";
import Link from "next/link";
import { combineClass } from "@/utils/combineClass";
import HeaderLogo from "./headerLogo";
import CreateCampaingButton from "./createCampaign/createCampaignHeaderButton";
import DisclaimerButton from "./disclaimerButton";
import DegenModeButton from "./degenMode/degenModeButton";
import ReferralButton from "./referral/referralButton";
import MobileMenu from "./mobileMenu";
import SimpleModeButton from "./simple/simpleModeButton";
import AdvancedModeButton from "./advanced/advancedModeButton";
import ThemeToggleButton from "./theme/themeToggleButton";

export default function Header({ simple = false }: { simple?: boolean }) {
  return (
    <header
      className={combineClass(
        "flex items-center justify-between self-stretch border-b-2 border-b-black bg-9blueLight text-xs transition-colors duration-300",
        "dark:bg-9black dark:border-b-9gray dark:text-9gray",
      )}
    >
      <Link
        data-test="header-logo"
        href="/"
        className="flex h-10 items-center justify-center px-4"
      >
        <HeaderLogo />
      </Link>
      <div className="hidden md:flex">
        {simple ? <DisclaimerButton /> : <SimpleModeButton />}
      </div>
      <div
        className={combineClass(
          "hidden h-10 flex-1 border-x-2 border-x-black transition-colors duration-300",
          "dark:border-x-9gray",
          "md:flex",
        )}
      >
        <NavigationMenu simple={simple} />
      </div>
      <CreateCampaingButton />
      <div className="relative flex items-center">
        <MobileMenu simple={simple} />
        <ThemeToggleButton className="md:border-l-0" />
        <ConnectButton />
        {simple ? <AdvancedModeButton /> : <DegenModeButton />}
        <ReferralButton />
      </div>
    </header>
  );
}
