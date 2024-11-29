"use client";
import {
  ConnectButton as ThirdWebButton,
  useActiveAccount,
} from "thirdweb/react";
import appConfig from "@/config";
import { arbitrum } from "thirdweb/chains";
import Image from "next/image";
import LoginIcon from "#/icons/login.svg";
export default function ConnectButton() {
  const account = useActiveAccount();
  return (
    <div className="flex items-center justify-center border-l-2 border-l-black">
      <ThirdWebButton
        client={appConfig.thirdweb.client}
        chain={arbitrum}
        appMetadata={appConfig.thirdweb.metadata}
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
