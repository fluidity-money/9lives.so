import { ethers, Signature } from "ethers";
import { destinationChain } from "@/config/chains";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";

export default function useSignForPermit() {
  const chain = useActiveWalletChain();
  const account = useActiveAccount();
  const domain = {
    name: "Bridged USDC (Stargate)",
    version: "1",
    chainId: destinationChain.id,
    verifyingContract: process.env.NEXT_PUBLIC_FUSDC_ADDR,
  };
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
  }: {
    spender: string;
    amountToSpend: BigInt;
  }) => {
    if (!chain) throw new Error("No chain is detected");
    if (!account) throw new Error("No account is connected");
    const provider = new ethers.JsonRpcProvider(chain.rpc);
    const nonce = await provider.getTransactionCount(account.address);

    const message = {
      owner: account.address,
      spender,
      value: amountToSpend,
      nonce,
      deadline: Math.floor(Date.now() / 1000) + 3600,
    };

    const signature = await account.signTypedData({
      domain,
      types,
      message,
      primaryType: "Permit",
    });

    const { r, s, v } = Signature.from(signature);

    return { r, s, v };
  };

  return { signForPermit };
}
