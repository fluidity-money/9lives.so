import ConnectButton from "@/components/connectButton";
import Navigation from "@/components/navigation";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div data-test="header-logo">Logo</div>
      <Navigation />
      <ConnectButton />
    </header>
  );
}
