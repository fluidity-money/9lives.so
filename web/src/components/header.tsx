import ConnectButton from "@/components/connectButton";
import Navigation from "@/components/navigation";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <Link href="/">
        <div data-test="header-logo">Logo</div>
      </Link>
      <Navigation />
      <ConnectButton />
    </header>
  );
}
