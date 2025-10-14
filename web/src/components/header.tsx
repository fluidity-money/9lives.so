import ConnectButton from "@/components/connectButton";
import NavigationMenu from "@/components/navMenu";
import Link from "next/link";
import HeaderLogo from "./headerLogo";
import CreateCampaingButton from "./createCampaign/createCampaignHeaderButton";
import DisclaimerButton from "./disclaimerButton";
import DegenModeButton from "./degenMode/degenModeButton";
import ReferralButton from "./referral/referralButton";
import MobileMenu from "./mobileMenu";
import SimpleModeButton from "./simple/simpleModeButton";
import AdvancedModeButton from "./advanced/advancedModeButton";

export default function Header({ simple = false }: { simple?: boolean }) {
  return (
    <header className="flex items-center justify-between self-stretch border-b-2 border-b-black bg-9blueLight text-xs">
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
      <div className="hidden h-10 flex-1 border-x-2 border-x-black md:flex">
        <NavigationMenu />
      </div>
      <CreateCampaingButton />
      <div className="relative flex items-center">
        <MobileMenu />
        <ConnectButton />
        {simple ? <AdvancedModeButton /> : <DegenModeButton />}
        <ReferralButton />
      </div>
    </header>
  );
}
