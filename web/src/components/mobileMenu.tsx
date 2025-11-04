"use client";
import Image from "next/image";
import MenuIcon from "#/icons/menu.svg";
import Modal from "./themed/modal";
import { useEffect, useState } from "react";
import NavigationMenu from "./navMenu";
import DisclaimerButton from "./disclaimerButton";
import DegenModeMobileWrapper from "./degenMode/degenModeMobileWrapper";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ReferralButton from "./referral/referralButton";
import SimpleModeButton from "./simple/simpleModeButton";

export default function MobileMenu({ simple = false }: { simple?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  return (
    <div
      className="flex size-10 items-center justify-center border-x-2 border-x-black md:hidden"
      onClick={() => setIsMobileMenuOpen(true)}
    >
      <Image src={MenuIcon} alt="menu" />
      <Modal
        setIsOpen={setIsMobileMenuOpen}
        isOpen={isMobileMenuOpen}
        title="Menu"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <NavigationMenu simple={simple} />
          <div className="flex flex-col items-center">
            <Link
              href={"/create-campaign"}
              className="flex h-10 items-center font-chicago text-xs underline"
            >
              Create Campaign
            </Link>
            <ReferralButton hideOnMobile={false} />
            {simple ? (
              <Link
                href={"/"}
                className="flex h-10 items-center font-chicago text-xs underline"
              >
                <span className="font-chicago text-xs underline">
                  Advanced Mode 🚀
                </span>
              </Link>
            ) : (
              <DegenModeMobileWrapper />
            )}
            {simple ? null : <SimpleModeButton />}
            <DisclaimerButton />
          </div>
        </div>
      </Modal>
    </div>
  );
}
