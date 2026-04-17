"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderLogo from "../headerLogo";
import ConnectButton from "./connectButton";
import svgPaths from "./leaderboard/svgPaths";

function NavLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className="h-full relative shrink-0 cursor-pointer">
      {active && (
        <div
          aria-hidden="true"
          className="absolute border-[#0e0e0e] border-b-2 border-solid inset-0 pointer-events-none"
        />
      )}
      <div className="flex items-center justify-center size-full">
        <div className="flex items-center justify-center px-[4px] py-[16px] size-full">
          <p
            className={`font-dmMono font-medium leading-[normal] shrink-0 text-[11.67px] uppercase whitespace-nowrap ${
              active ? "text-[#0e0e0e]" : "text-[#a3a3a3]"
            }`}
          >
            {label}
          </p>
        </div>
      </div>
    </Link>
  );
}

function HeaderSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`h-full relative shrink-0 ${className ?? ""}`}>
      <div
        aria-hidden="true"
        className="absolute border-[#e5e5e5] border-l border-solid inset-[0_0_0_-0.5px] pointer-events-none"
      />
      <div className="flex items-center justify-center size-full">
        <div className="flex gap-[4px] items-center justify-center p-[16px] size-full cursor-pointer hover:bg-[#fafafa] transition-colors">
          {children}
        </div>
      </div>
    </div>
  );
}

const routes = [
  { name: "MARKETPLACE", path: "/" },
  { name: "PORTFOLIO", path: "/v1/portfolio" },
  { name: "LEADERBOARD", path: "/leaderboard" },
];

function MobileMenu({
  isOpen,
  onClose,
  isActive,
}: {
  isOpen: boolean;
  onClose: () => void;
  isActive: (path: string) => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute top-[48px] right-0 z-50 w-[200px] bg-[#fdfdfd] border border-[#e5e5e5] rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] overflow-hidden"
    >
      <div className="flex flex-col py-[4px]">
        {routes.map((r) => (
          <Link
            key={r.path}
            href={r.path}
            onClick={onClose}
            className={`flex items-center gap-[8px] px-[16px] py-[12px] font-dmMono font-medium text-[11.67px] uppercase transition-colors ${
              isActive(r.path)
                ? "text-[#0e0e0e] bg-[#fafafa]"
                : "text-[#a3a3a3] hover:bg-[#fafafa]"
            }`}
          >
            {r.name}
          </Link>
        ))}
        <div className="border-t border-[#e5e5e5] my-[4px]" />
        <Link
          href="#"
          onClick={onClose}
          className="flex items-center gap-[8px] px-[16px] py-[12px] font-dmMono font-medium text-[11.67px] uppercase text-[#a3a3a3] hover:bg-[#fafafa] transition-colors"
        >
          <svg className="size-[12px]" fill="none" viewBox="0 0 16.9917 16">
            <path d={svgPaths.p3cadd400} fill="#a3a3a3" />
          </svg>
          REWARDS
        </Link>
        <Link
          href="#"
          onClick={onClose}
          className="flex items-center gap-[8px] px-[16px] py-[12px] font-dmMono font-medium text-[11.67px] uppercase text-[#a3a3a3] hover:bg-[#fafafa] transition-colors"
        >
          <svg className="size-[12px]" fill="none" viewBox="0 0 11.792 7.50114">
            <path d={svgPaths.p3ba8a480} fill="#a3a3a3" />
          </svg>
          REFERRAL
        </Link>
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(path: string) {
    if (path === "/") {
      return (
        pathname === "/" ||
        pathname.startsWith("/campaign") ||
        pathname.startsWith("/simple")
      );
    }
    return pathname.startsWith(path);
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="h-[48px] relative shrink-0 w-full sticky top-0 z-40 bg-[#fdfdfd]">
      <div
        aria-hidden="true"
        className="absolute border-[#e5e5e5] border-b border-solid inset-[0_0_-1px_0] pointer-events-none"
      />
      <div className="flex items-center size-full">
        <div className="flex items-center justify-between pl-[16px] size-full">
          {/* Left: Logo + Nav */}
          <div className="flex gap-[16px] h-full items-center shrink-0">
            <Link
              data-test="header-logo"
              href="/"
              className="flex h-full items-center justify-center px-[4px]"
            >
              <HeaderLogo />
            </Link>
            <nav className="hidden md:flex gap-[8px] h-full items-center shrink-0">
              {routes.map((r) => (
                <NavLink
                  key={r.path}
                  label={r.name}
                  href={r.path}
                  active={isActive(r.path)}
                />
              ))}
            </nav>
          </div>

          {/* Right: Rewards | Referral | User + Mobile Menu */}
          <div className="flex h-full items-center justify-end shrink-0">
            <HeaderSection className="hidden md:block">
              <svg
                className="size-[12px]"
                fill="none"
                viewBox="0 0 16.9917 16"
              >
                <path d={svgPaths.p3cadd400} fill="black" />
              </svg>
              <p className="font-dmMono font-medium leading-[normal] shrink-0 text-[#0e0e0e] text-[11.67px] uppercase whitespace-nowrap">
                REWARDS
              </p>
            </HeaderSection>
            <HeaderSection className="hidden md:block">
              <svg
                className="size-[12px]"
                fill="none"
                viewBox="0 0 11.792 7.50114"
              >
                <path d={svgPaths.p3ba8a480} fill="black" />
              </svg>
              <p className="font-dmMono font-medium leading-[normal] shrink-0 text-[#0e0e0e] text-[11.67px] uppercase whitespace-nowrap">
                REFERRAL
              </p>
            </HeaderSection>
            {/* Mobile menu toggle */}
            <div className="h-full relative shrink-0 md:hidden">
              <div
                aria-hidden="true"
                className="absolute border-[#e5e5e5] border-l border-solid inset-[0_0_0_-0.5px] pointer-events-none"
              />
              <div className="flex items-center justify-center size-full">
                <button
                  className="flex items-center justify-center p-[14px] size-full cursor-pointer hover:bg-[#fafafa] transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <svg className="size-[18px]" fill="none" viewBox="0 0 16 16">
                      <path d="M4 4L12 12M12 4L4 12" stroke="#0e0e0e" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="size-[18px]" fill="none" viewBox="0 0 16 16">
                      <path d="M2 4H14M2 8H14M2 12H14" stroke="#0e0e0e" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
              <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                isActive={isActive}
              />
            </div>
            {/* Connect wallet */}
            <div className="h-full relative shrink-0">
              <div
                aria-hidden="true"
                className="absolute border-[#e5e5e5] border-l border-solid inset-[0_0_0_-1px] pointer-events-none"
              />
              <div className="flex items-center justify-end size-full">
                <div className="flex gap-[4px] items-center justify-end p-[12px] md:p-[16px] size-full">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
