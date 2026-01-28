import ConnectButton from "@/components/connectButton";
import NavigationMenu from "@/components/navMenu";
import Link from "next/link";
import HeaderLogo from "./headerLogo";
import CreateCampaingButton from "./createCampaign/createCampaignHeaderButton";
import ReferralButton from "./referral/referralButton";
import MobileMenu from "./mobileMenu";
import ModeSwitchButton from "./modeSwitchButton";

export default function Header({ simple = false }: { simple?: boolean }) {
  return (
    <header className="flex items-center justify-between self-stretch border-b-2 border-b-black bg-9blueLight text-xs">
      <Link
        data-test="header-logo"
        href="/v1"
        className="flex h-10 items-center justify-center px-4"
      >
        <HeaderLogo />
      </Link>
      {/* <div className="hidden md:flex">
        <DisclaimerButton />
      </div> */}
      <div className="hidden h-10 flex-1 border-x-2 border-x-black md:flex">
        <NavigationMenu simple={simple} />
      </div>
      <CreateCampaingButton />
      <div className="relative flex items-center">
        <MobileMenu simple={simple} />
        <ConnectButton />
        <ModeSwitchButton />
        <ReferralButton />
      </div>
    </header>
  );
}
