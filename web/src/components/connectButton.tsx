"use client";
import { ConnectButton as ThirdWebButton } from "thirdweb/react";
import appConfig from "@/config";
import { arbitrumOneMainnet } from "@/config/chains";

export default function ConnectButton() {
  return (
    <ThirdWebButton
      client={appConfig.thirdweb.client}
      chain={arbitrumOneMainnet}
      appMetadata={appConfig.thirdweb.metadata}
      wallets={appConfig.thirdweb.wallets}
      theme={appConfig.thirdweb.theme}
      detailsButton={appConfig.thirdweb.detailsButton}
      connectButton={appConfig.thirdweb.connectButton}
      connectModal={appConfig.thirdweb.connectModal}
    />
  );
}
