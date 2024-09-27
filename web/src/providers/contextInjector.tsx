"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useEffect } from "react";
import { setTag, setUser } from "@sentry/nextjs";

export default function ContextInjector() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();

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

  return null;
}
