import { useEffect } from "react";
import {
  createClient,
  LogLevel,
  convertViemChainToRelayChain,
  MAINNET_RELAY_API,
} from "@reservoir0x/relay-sdk";
import config from "@/config";

export default function RelayProvider() {
  const relayChains = Object.values(config.chains).map((c) =>
    convertViemChainToRelayChain(c),
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
