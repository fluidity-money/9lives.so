import { useEffect } from "react";
import {
  createClient,
  LogLevel,
  convertViemChainToRelayChain,
  MAINNET_RELAY_API,
} from "@reservoir0x/relay-sdk";
import config from "@/config";
import { Chain } from "thirdweb";

function convertThirdwebChain2Viem(
  c: Chain,
): Parameters<typeof convertViemChainToRelayChain>[0] {
  return {
    ...c,
    name: c.name ?? "",
    nativeCurrency: {
      decimals: c.nativeCurrency?.decimals ?? 0,
      name: c.nativeCurrency?.name ?? "",
      symbol: c.nativeCurrency?.symbol ?? "",
    },
    rpcUrls: { default: { http: [c.rpc] } },
    blockExplorers: {
      default: c.blockExplorers?.[0] ?? {
        name: c.name ?? "",
        apiUrl: "",
        url: "",
      },
    },
  };
}

export default function RelayProvider() {
  const relayChains = Object.values(config.chains).map((c) =>
    convertViemChainToRelayChain(convertThirdwebChain2Viem(c)),
  );
  useEffect(() => {
    createClient({
      baseApiUrl: MAINNET_RELAY_API,
      source: "9lives.so",
      chains: relayChains,
      logLevel:
        config.NEXT_PUBLIC_CHAIN === "mainnet"
          ? LogLevel.Error
          : LogLevel.Verbose,
    });
  }, [relayChains]);
  return null;
}
