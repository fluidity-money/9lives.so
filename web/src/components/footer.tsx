import Link from "next/link";
import FooterLogo from "./footerLogo";
import FooterMenu from "./footerMenu";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between border-t-2 border-t-black bg-9blueLight px-4 py-8">
      <Link href="/">
        <FooterLogo />
      </Link>
      <FooterMenu />
    </footer>
  );
}
