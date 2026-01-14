import { destinationChain } from "@/config/chains";
import config from "@/config";
import { usePublicClient, useSignTypedData } from "wagmi";
import { parseSignature } from "viem";

export default function useSignForPermit(address?: string) {
  const { mutateAsync: signTypedData } = useSignTypedData();
  const publicClient = usePublicClient();
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const signForPermit = async ({
    spender,
    amountToSpend,
    deadline,
  }: {
    spender: string;
    amountToSpend: bigint;
    deadline: number;
  }) => {
    if (!address) throw new Error("No account is connected");
    if (!publicClient) throw new Error("Public client is not set");
    const name = await publicClient.readContract({
      ...config.contracts.fusdc,
      functionName: "name",
      args: [],
    });
    const nonce = await publicClient.readContract({
      ...config.contracts.fusdc,
      functionName: "nonces",
      args: [address as `0x${string}`],
    });
    const domain = {
      name,
      version: "2",
      chainId: destinationChain.id,
      verifyingContract: process.env.NEXT_PUBLIC_FUSDC_ADDR as `0x${string}`,
    };

    const message = {
      owner: address,
      spender,
      value: amountToSpend,
      nonce,
      deadline,
    };

    const signature = await signTypedData({
      domain,
      types,
      message,
      primaryType: "Permit",
    });

    const { r, s, v } = parseSignature(signature);

    return { r, s, v };
  };

  return { signForPermit };
}
