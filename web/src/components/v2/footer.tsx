"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const socials = [
  { title: "Twitter /X", page: "https://x.com/superpositionso" },
  { title: "Telegram", page: "https://t.me/superaboringjokes" },
  { title: "Discord", page: "https://discord.gg/VjUWjRQP8y" },
];

const links = [
  { title: "Terms & conditions", page: "#" },
  { title: "Privacy Policy", page: "https://static.9lives.so/privacy.pdf" },
];

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const isV1 = pathname.startsWith("/v1");

  return (
    <footer className="hidden md:block backdrop-blur-[2px] bg-[rgba(253,253,253,0.6)] relative shrink-0 w-full">
      <div
        aria-hidden="true"
        className="absolute border-[#d4d4d4] border-solid border-t inset-0 pointer-events-none"
      />
      <div className="flex items-center size-full">
        <div className="flex items-center justify-between px-[16px] py-[8px] relative size-full">
          {/* Left: version toggle + links */}
          <div className="flex gap-[10px] items-center shrink-0">
            {/* v1/v2 toggle */}
            <div className="flex h-[35px] items-center justify-center max-h-[40px] p-[4px] relative rounded-[12px] shrink-0 w-[98px]">
              <div
                aria-hidden="true"
                className="absolute bg-[#f5f5f5] inset-0 pointer-events-none rounded-[12px]"
              />
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.7)]" />
              {(["v1", "v2"] as const).map((v) => (
                <div key={v} className="flex items-center self-stretch z-[1]">
                  <div
                    className={`h-full relative shrink-0 cursor-pointer ${
                      (v === "v1" && isV1) || (v === "v2" && !isV1)
                        ? "bg-[#fdfdfd] rounded-[8px] shadow-[2px_2px_8px_0px_rgba(178,178,178,0.5)]"
                        : "rounded-[4px]"
                    }`}
                    onClick={() => {
                      if (v === "v1") {
                        // Map current V2 path to its V1 equivalent
                        const v1Path = pathname === "/leaderboard"
                          ? "/v1/leaderboard"
                          : pathname === "/portfolio"
                            ? "/v1/portfolio"
                            : "/v1";
                        router.push(v1Path);
                      } else {
                        router.push("/");
                      }
                    }}
                  >
                    <div className="flex items-center justify-center size-full">
                      <div className="flex items-center justify-center px-[16px] py-[6px] size-full">
                        <span
                          className={`font-overusedGrotesk font-medium text-[11.67px] tracking-[0.2334px] whitespace-nowrap ${
                            (v === "v1" && isV1) || (v === "v2" && !isV1)
                              ? "text-[#0e0e0e]"
                              : "text-[#a3a3a3]"
                          }`}
                        >
                          {v}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {links.map((item) => (
              <Link
                key={item.title}
                href={item.page}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-[4px] items-center justify-center p-[4px] shrink-0 cursor-pointer hover:underline"
              >
                <p className="font-overusedGrotesk font-medium text-[#0e0e0e] text-[14px] whitespace-nowrap">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>

          {/* Right: socials */}
          <div className="flex gap-[10px] items-center justify-end shrink-0">
            {socials.map((item) => (
              <Link
                key={item.title}
                href={item.page}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-[4px] items-center justify-center p-[4px] shrink-0 cursor-pointer hover:underline"
              >
                <p className="font-overusedGrotesk font-medium text-[#0e0e0e] text-[14px] whitespace-nowrap">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
