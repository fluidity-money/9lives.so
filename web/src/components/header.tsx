import ConnectButton from "@/components/connectButton";
import NavigationMenu from "@/components/navMenu";
import Link from "next/link";
import HeaderLogo from "./headerLogo";
import dynamic from "next/dynamic";
import CreateCampaingButton from "./createCampaignButton";
import GetFusdcButton from "./getFusdcButton";

const Clock = dynamic(() => import("@/components/clock"), { ssr: false });

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b-2 border-b-black bg-9blueLight text-xs">
      <Link
        data-test="header-logo"
        href="/"
        className="flex h-10 items-center justify-center px-4"
      >
        <HeaderLogo />
      </Link>
      <NavigationMenu />
      <GetFusdcButton />
      <CreateCampaingButton />
      <ConnectButton />
      <Clock />
    </header>
  );
}
