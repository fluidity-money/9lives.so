"use client";
import { ConnectButton as ThirdWebButton } from "thirdweb/react";
import appConfig from "@/config";
import { superpositionTestnet } from "@/config/chains";

export default function ConnectButton() {
  return (
    <ThirdWebButton
      client={appConfig.thirdweb.client}
      chain={superpositionTestnet}
      appMetadata={appConfig.thirdweb.metadata}
      accountAbstraction={appConfig.thirdweb.accountAbstraction}
      theme={appConfig.thirdweb.theme}
      detailsButton={appConfig.thirdweb.detailsButton}
      connectButton={appConfig.thirdweb.connectButton}
      connectModal={appConfig.thirdweb.connectModal}
    />
  );
}
