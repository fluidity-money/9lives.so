"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useEffect } from "react";
import { setTag, setUser } from "@sentry/nextjs";
import { useUserStore } from "@/stores/userStore";

export default function ContextInjector() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const degenModeEnabled = useUserStore((state) => state.degenModeEnabled);

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

  useEffect(() => {
    const body = document.getElementsByTagName("body")[0];
    if (degenModeEnabled) body.classList.add("degen-mode");
    else body.classList.remove("degen-mode");
  }, [degenModeEnabled]);

  return null;
}
