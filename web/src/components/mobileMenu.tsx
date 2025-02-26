"use client";
import Image from "next/image";
import MenuIcon from "#/icons/menu.svg";
import Modal from "./themed/modal";
import { useEffect, useState } from "react";
import NavigationMenu from "./navMenu";
import DisclaimerButton from "./disclaimerButton";
import DegenModeMobileWrapper from "./degenMode/degenModeMobileWrapper";
import { usePathname } from "next/navigation";

export default function MobileMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  return (
    <div
      className="flex size-10 items-center justify-center border-l-2 border-l-black md:hidden"
      onClick={() => setIsMobileMenuOpen(true)}
    >
      <Image src={MenuIcon} alt="menu" />
      <Modal
        setIsOpen={setIsMobileMenuOpen}
        isOpen={isMobileMenuOpen}
        title="Menu"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <NavigationMenu />
          <div className="flex flex-col items-center">
            <DegenModeMobileWrapper />
            <DisclaimerButton />
          </div>
        </div>
      </Modal>
    </div>
  );
}
