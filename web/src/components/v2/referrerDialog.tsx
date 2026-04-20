"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppKitAccount } from "@reown/appkit/react";
import useReferrerCode from "@/hooks/useReferrerCode";
import useCountReferees from "@/hooks/useCountReferees";
import { genReferrer } from "@/providers/graphqlClient";
import { generateReferralCode } from "@/utils/generateReferralCode";
import { combineClass } from "@/utils/combineClass";

export default function ReferrerDialog({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const account = useAppKitAccount();
  const {
    data: code,
    isSuccess,
    error,
    isLoading,
    refetch,
  } = useReferrerCode(account?.address);
  const { data: refereeCount } = useCountReferees(account?.address);
  const [genError, setGenError] = useState<string>();
  const [activeTab, setActiveTab] = useState<"how" | "fees">("how");
  const [hasCopied, setHasCopied] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const referralUrl = code ? `https://9lives.so/?referral=${code}` : "";

  const tweetText = encodeURIComponent(
    `Got a hot take on the future?\nOn 9Lives, you can create your own market, trade on predictions, and earn.\n\nIt's open, permissionless, and built on Superposition.\n\nJoin me here: ${referralUrl}`,
  );
  const shareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  useEffect(() => {
    async function generateCode() {
      try {
        if (!account?.address)
          throw new Error("Connect your wallet to generate a referral code");
        const newCode = generateReferralCode();
        await genReferrer({ address: account.address, code: newCode });
        await refetch();
      } catch (e) {
        setGenError(e instanceof Error ? e.message : "Unknown error");
      }
    }
    if (isSuccess && !code) generateCode();
  }, [code, isSuccess, account?.address, refetch]);

  function handleCopy() {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied");
    setHasCopied(true);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1600);
  }

  if (isLoading || (isSuccess && !code)) {
    return (
      <div className="flex flex-col gap-[16px] py-[8px]">
        <div className="h-[28px] w-[200px] rounded bg-neutral-200 animate-pulse" />
        <div className="h-[40px] w-full rounded-[12px] bg-neutral-100 animate-pulse" />
        <div className="h-[40px] w-full rounded-full bg-neutral-100 animate-pulse" />
        <div className="h-[96px] w-full rounded-[12px] bg-neutral-100 animate-pulse" />
        <div className="h-[48px] w-full rounded-[12px] bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center gap-[8px] py-[32px]">
        <span className="font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e]">
          Something went wrong
        </span>
        <span className="font-dmMono text-[11px] text-[#737373]">
          {error?.message ?? genError ?? "Unknown error"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Top: diamond + title + subtitle */}
      <div className="flex gap-[16px] items-start">
        <span className="text-[56px] leading-none shrink-0 select-none" aria-hidden>
          💎
        </span>
        <div className="flex flex-col gap-[6px] flex-1 min-w-0 pt-[2px]">
          <span className="font-overusedGrotesk font-bold text-[24px] text-[#0e0e0e] leading-[1.1]">
            {refereeCount ?? 0} Active Referrals
          </span>
          <span className="font-overusedGrotesk text-[15px] text-[#525252] leading-[1.35]">
            Refer users using your link to earn more rewards!
          </span>
        </div>
      </div>

      {/* Referral URL — full-width centered pill */}
      <button
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={combineClass(
          "w-full rounded-full border px-[20px] py-[12px] cursor-pointer transition-colors shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.35)]",
          hasCopied
            ? "bg-[#dcfce7] border-[#bbf7d0] hover:bg-[#c7f2d3]"
            : "bg-[#f5f5f5] border-[#e5e5e5] hover:bg-[#ededed]",
        )}
        title="Click to copy"
      >
        {justCopied ? (
          <span className="flex items-center justify-center gap-[8px] font-overusedGrotesk font-semibold text-[15px] text-[#15803d]">
            <svg
              className="size-[16px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Link Copied
          </span>
        ) : isHovering && !hasCopied ? (
          <span className="flex items-center justify-center gap-[8px] font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e]">
            <svg
              className="size-[16px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Your Link
          </span>
        ) : (
          <span
            className={combineClass(
              "font-dmMono text-[14px] tracking-[0.3px] truncate block text-center",
              hasCopied ? "text-[#15803d]" : "text-[#525252]",
            )}
          >
            {referralUrl}
          </span>
        )}
      </button>

      {/* Segmented tab */}
      <div className="relative flex items-center rounded-full bg-[#f0f0f0] p-[4px] border border-[#e5e5e5]">
        <button
          type="button"
          onClick={() => setActiveTab("how")}
          className={combineClass(
            "flex-1 rounded-full py-[10px] font-overusedGrotesk font-semibold text-[14px] transition-colors cursor-pointer",
            activeTab === "how"
              ? "bg-[#fdfdfd] text-[#0e0e0e] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              : "text-[#a3a3a3] hover:text-[#525252]",
          )}
        >
          How it works
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("fees")}
          className={combineClass(
            "flex-1 rounded-full py-[10px] font-overusedGrotesk font-semibold text-[14px] transition-colors cursor-pointer",
            activeTab === "fees"
              ? "bg-[#fdfdfd] text-[#0e0e0e] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              : "text-[#a3a3a3] hover:text-[#525252]",
          )}
        >
          Fees Generated
        </button>
      </div>

      {/* Tab content */}
      <div className="rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] p-[16px] shadow-[inset_1px_1px_3px_0px_rgba(163,163,163,0.25)]">
        {activeTab === "how" ? (
          <div className="flex flex-col gap-[12px]">
            <div className="flex items-center justify-between gap-[16px]">
              <div className="flex items-center gap-[8px]">
                <span className="font-overusedGrotesk font-bold text-[15px] text-[#0e0e0e]">
                  1 .
                </span>
                <span className="font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e]">
                  Copy Your Link.
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="font-overusedGrotesk font-bold text-[15px] text-[#0e0e0e]">
                  2 .
                </span>
                <span className="font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e]">
                  Share with your friends.
                </span>
              </div>
            </div>
            <div className="rounded-[10px] bg-[#dcfce7] px-[16px] py-[12px] text-center">
              <span className="font-overusedGrotesk font-medium text-[15px] text-[#15803d]">
                You get %1 of fees generated by referred user.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-[6px] py-[16px]">
            <span className="font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e]">
              Coming soon
            </span>
            <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#737373]">
              Fee tracking will appear here
            </span>
          </div>
        )}
      </div>

      {/* Share to X */}
      <Link href={shareUrl} target="_blank" rel="noreferrer" className="w-full">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-[10px] rounded-[12px] bg-[#fdfdfd] border border-[#e5e5e5] py-[14px] font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e] hover:bg-[#fafafa] transition-colors cursor-pointer"
        >
          <svg
            className="size-[16px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share to X
        </button>
      </Link>
    </div>
  );
}
