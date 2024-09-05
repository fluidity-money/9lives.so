import { abi } from "#/abis/dpm";
import { createThirdwebClient } from "thirdweb";
import { getContract } from "thirdweb";

const net = (process.env.NEXT_PUBLIC_NET ?? "testnet") as "mainnet" | "testnet";
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_ID;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

if (!clientId) throw new Error("No client ID provided");
if (!contractAddress) throw new Error("No contract address provided");
const chains = {
  superposition: {
    testnet: {
      name: "Superposition Testnet",
      id: 98985,
      nativeCurrency: { name: "Superposition", symbol: "SPN", decimals: 18 },
      rpc: "https://testnet-rpc.superposition.so",
    },
    mainnet: {
      name: "Superposition Mainnet",
      id: 98985,
      nativeCurrency: { name: "Superposition", symbol: "SPN", decimals: 18 },
      rpc: "https://rpc.superposition.so",
    },
  },
};
const metadata = {
  title: "Purr.Stream",
  description: "Donate onchain and support animal welfare",
  metadataBase: new URL("https://purr.stream"),
  keywords: [
    "cat",
    "donate",
    "stream",
    "purr",
    "purr.stream",
    "onchain",
    "animal",
    "welfare",
    "superposition",
    "blockchain",
  ],
};
const thirdwebClient = createThirdwebClient({
  clientId,
});
const contract = getContract({
  client: thirdwebClient,
  chain: chains.superposition[net],
  address: contractAddress,
  abi,
});

export const config = {
  metadata,
  contracts: {
    donation: {
      address: contractAddress,
      abi,
      contract,
    },
  },
  features: {
    web3: {
      all: true,
    },
  },
  thirdweb: {
    clientId,
    client: thirdwebClient,
    chain: chains.superposition[net],
    accountAbstraction: {
      chain: chains.superposition[net],
      sponsorGas: true,
    },
    appMetadata: {
      name: metadata.title as string,
      url: metadata.metadataBase?.href,
      description: metadata.description!,
      logoUrl: metadata.metadataBase + "/images/logo.svg",
    },
  },
};
