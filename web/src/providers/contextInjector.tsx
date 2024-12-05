"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useEffect } from "react";
import { setTag, setUser } from "@sentry/nextjs";
import { usePathname } from "next/navigation";

export default function ContextInjector() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const pathname = usePathname();

  useEffect(() => {
    if (account?.address) {
      // wallet address stored to local storage for GTM to use it
      window.localStorage.setItem("walletAddress", account.address);
      setUser({ id: account.address });
    } else {
      window.localStorage.removeItem("walletAddress");
      setUser(null);
    }
  }, [account?.address]);

  useEffect(() => {
    setTag("chainId", chain?.id);
  }, [chain?.id]);

  // this var(--body-height) is for degen mode panel
  // update per page
  useEffect(() => {
    const updateBodyHeight = () => {
      const bodyHeight = document.body.offsetHeight;
      document.documentElement.style.setProperty(
        "--body-height",
        `${bodyHeight}px`,
      );
    };
    updateBodyHeight();
    // Add an event listener for window resize
    window.addEventListener("resize", updateBodyHeight);
    return () => {
      window.removeEventListener("resize", updateBodyHeight);
    };
  }, [pathname]);

  return null;
}
