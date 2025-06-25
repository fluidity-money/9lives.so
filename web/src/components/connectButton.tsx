"use client";
import {
  ConnectButton as ThirdWebButton,
  useActiveAccount,
} from "thirdweb/react";
import appConfig from "@/config";
import Image from "next/image";
import LoginIcon from "#/icons/login.svg";
import { useUserStore } from "@/stores/userStore";
import useConnectWithFarcaster from "@/hooks/useConnetWithFarcaster";
export default function ConnectButton() {
  const account = useActiveAccount();
  const { connectWallet: connectWithFarcaster } = useConnectWithFarcaster();
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const chains =
    appConfig.NEXT_PUBLIC_CHAIN === "mainnet"
      ? isInMiniApp
        ? Object.values(appConfig.farcasterChains)
        : Object.values(appConfig.chains)
      : [appConfig.destinationChain];

  if (isInMiniApp && !account)
    return (
      <button
        onClick={connectWithFarcaster}
        className="font-xs h-10 border-l-2 border-l-black px-2 font-chicago"
      >
        Connect Wallet
      </button>
    );

  return (
    <div className="flex items-center justify-center border-l-2 border-l-black">
      <ThirdWebButton
        client={appConfig.thirdweb.client}
        chains={chains}
        appMetadata={appConfig.thirdweb.metadata}
        detailsModal={appConfig.thirdweb.detailsModal}
        wallets={appConfig.thirdweb.wallets}
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
