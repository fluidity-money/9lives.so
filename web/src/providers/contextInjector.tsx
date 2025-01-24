"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useEffect } from "react";
import { setTag, setUser } from "@sentry/nextjs";
import { useDegenStore } from "@/stores/degenStore";
import { usePathname } from "next/navigation";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function ContextInjector() {
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const chain = useActiveWalletChain();
  const degenModeEnabled = useDegenStore((state) => state.degenModeEnabled);
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

  useEffect(() => {
    const body = document.getElementsByTagName("body")[0];
    if (degenModeEnabled) body.classList.add("degen-mode");
    else body.classList.remove("degen-mode");
  }, [degenModeEnabled]);

  // add margin for fixed action component on campaign details
  useEffect(() => {
    const footer = document.getElementsByTagName("footer")[0];
    if (pathname.startsWith("/campaign/"))
      footer.classList.add("mint-box-margin");
    else footer.classList.remove("mint-box-margin");
  }, [pathname]);

  // pop up connect modal if user navigates any campaign page
  useEffect(() => {
    const previouslyConnected = window.localStorage.getItem(
      "thirdweb:active-wallet-id",
    );
    if (pathname.startsWith("/campaign/") && !account && !previouslyConnected) {
      connect();
    }
  }, [pathname, account, connect]);

  return null;
}
