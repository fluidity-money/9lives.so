"use client";
import {
  ConnectButton as ThirdWebButton,
  useActiveAccount,
} from "thirdweb/react";
import appConfig from "@/config";
import Image from "next/image";
import LoginIcon from "#/icons/login.svg";
import { useUserStore } from "@/stores/userStore";
import { farcasterWallet } from "@/providers/farcaster";
export default function ConnectButton() {
  const account = useActiveAccount();
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const chains =
    appConfig.NEXT_PUBLIC_CHAIN === "mainnet"
      ? isInMiniApp
        ? Object.values(appConfig.farcasterChains)
        : Object.values(appConfig.chains)
      : [appConfig.destinationChain];

  return (
    <div className="flex items-center justify-center border-l-2 border-l-black">
      <ThirdWebButton
        client={appConfig.thirdweb.client}
        chains={chains}
        appMetadata={appConfig.thirdweb.metadata}
        detailsModal={appConfig.thirdweb.detailsModal}
        wallets={isInMiniApp ? [farcasterWallet] : appConfig.thirdweb.wallets}
        theme={appConfig.thirdweb.theme}
        detailsButton={appConfig.thirdweb.detailsButton}
        connectButton={appConfig.thirdweb.connectButton}
        connectModal={appConfig.thirdweb.connectModal}
        switchButton={appConfig.thirdweb.switchButton}
      />
      {account ? null : (
        <Image
          src={LoginIcon}
          height={14}
          width={14}
          alt="Connect Wallet"
          className="mr-4"
        />
      )}
    </div>
  );
}
