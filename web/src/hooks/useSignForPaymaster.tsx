import { destinationChain } from "@/config/chains";
import { PaymasterType } from "@/types";
import config from "@/config";
import { hashChainId } from "@/utils/hashChainId";
import { parseSignature, zeroAddress } from "viem";
import { usePublicClient, useSignTypedData } from "wagmi";

export default function useSignForPaymaster(
  chainId?: number | string,
  address?: string,
) {
  const { mutateAsync: signTypedData } = useSignTypedData();
  const publicClient = usePublicClient();
  const domain = {
    name: "NineLivesPaymaster",
    version: "1",
    chainId: Number(chainId ?? destinationChain.id),
    verifyingContract: process.env.NEXT_PUBLIC_PAYMASTER_ADDR as `0x${string}`,
    salt: hashChainId(destinationChain.id),
  };
  const types = {
    NineLivesPaymaster: [
      { name: "owner", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "typ", type: "uint8" },
      { name: "market", type: "address" },
      { name: "maximumFee", type: "uint256" },
      { name: "amountToSpend", type: "uint256" },
      { name: "minimumBack", type: "uint256" },
      { name: "referrer", type: "address" },
      { name: "outcome", type: "bytes8" },
      { name: "maxOutgoing", type: "uint256" },
    ],
  };
  const signForPaymaster = async ({
    tradingAddr,
    amountToSpend,
    deadline,
    referrer = zeroAddress,
    minimumBack,
    outcomeId,
    type,
  }: {
    tradingAddr: string;
    referrer?: string;
    amountToSpend: bigint;
    deadline: number;
    outcomeId?: string;
    type: PaymasterType;
    minimumBack: bigint;
  }) => {
    if (!chainId) throw new Error("No chain is detected");
    if (!address) throw new Error("No account is connected");
    if (!publicClient) throw new Error("Public client is not set");

    const domainSeparator = await publicClient.readContract({
      ...config.contracts.paymaster,
      functionName: "domainSeparators",
      args: [BigInt(chainId)],
    });

    const nonce = await publicClient.readContract({
      ...config.contracts.paymaster,
      functionName: "nonces",
      args: [domainSeparator, address as `0x${string}`],
    });

    const message = {
      owner: address,
      nonce,
      deadline,
      typ: type,
      market: tradingAddr,
      maximumFee: BigInt(0),
      amountToSpend,
      minimumBack,
      referrer,
      outcome: outcomeId,
      maxOutgoing: BigInt(0),
    };

    const signature = await signTypedData({
      domain,
      types,
      message,
      primaryType: "NineLivesPaymaster",
    });

    const { r, s, v } = parseSignature(signature);

    return { r, s, v, nonce };
  };

  return { signForPaymaster };
}
