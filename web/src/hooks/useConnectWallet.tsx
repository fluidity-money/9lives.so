import appConfig from "@/config"
import { useConnectModal } from "thirdweb/react"

export default function useConnectWallet() {
  const { connect, isConnecting } = useConnectModal()
  const handleConnect = () => connect({
    client: appConfig.thirdweb.client,
    chain: appConfig.thirdweb.chain,
    appMetadata: appConfig.thirdweb.metadata,
    accountAbstraction: appConfig.thirdweb.accountAbstraction,
    theme: appConfig.thirdweb.theme,
    showThirdwebBranding: appConfig.thirdweb.connectModal.showThirdwebBranding,
    showAllWallets: false
  })
  return { connect: handleConnect, isConnecting }
}