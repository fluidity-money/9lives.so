import ConnectButton from "@/components/connectButton";
import NavigationMenu from "@/components/navMenu";
import Link from "next/link";
import HeaderLogo from "./headerLogo";
import dynamic from "next/dynamic";
import CreateCampaingButton from "./createCampaign/createCampaignHeaderButton";
import GetFusdcButton from "./getFusdcButton";
import DisclaimerButton from "./disclaimerButton";
import DegenMode from "./degenMode";

const Clock = dynamic(() => import("@/components/clock"), { ssr: false });

export default function Header() {
  return (
    <header className="flex items-center justify-between self-stretch border-b-2 border-b-black bg-9blueLight text-xs">
      <Link
        data-test="header-logo"
        href="/"
        className="flex h-10 items-center justify-center px-4"
      >
        <HeaderLogo />
      </Link>
      <DisclaimerButton />
      <GetFusdcButton />
      <NavigationMenu />
      <CreateCampaingButton />
      <div className="relative flex items-center">
        <ConnectButton />
        <DegenMode />
        <Clock />
      </div>
    </header>
  );
}
