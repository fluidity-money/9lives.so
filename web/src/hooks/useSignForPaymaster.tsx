import { ethers, Signature } from "ethers";
import { destinationChain } from "@/config/chains";
import { PaymasterType } from "@/types";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { ZERO_ADDRESS } from "thirdweb";

export default function useSignForPaymaster() {
  const chain = useActiveWalletChain();
  const account = useActiveAccount();
  const domain = {
    name: "NineLivesPaymaster",
    version: "1",
    chainId: chain?.id ?? destinationChain.id,
    verifyingContract: process.env.NEXT_PUBLIC_PAYMASTER_ADDR,
    salt: "0x83e46451d84d0dee47dc069730514d369f8cccfecdb0852ecd036d7aa3ee5476" as `0x${string}`, //keccak of superposition chain id
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
    ],
  };
  const signForPermit = async ({
    tradingAddr,
    amountToSpend,
    referrer = ZERO_ADDRESS,
    minimumBack,
    outcomeId,
    type,
  }: {
    tradingAddr: string;
    referrer?: string;
    amountToSpend: BigInt;
    outcomeId: string;
    type: PaymasterType;
    minimumBack: BigInt;
  }) => {
    if (!chain) throw new Error("No chain is detected");
    if (!account) throw new Error("No account is connected");
    const provider = new ethers.JsonRpcProvider(chain.rpc);
    const nonce = await provider.getTransactionCount(account.address);

    const message = {
      owner: account.address,
      nonce,
      deadline: Math.floor(Date.now() / 1000) + 3600,
      typ: type,
      market: tradingAddr,
      maximumFee: BigInt(0),
      amountToSpend,
      minimumBack,
      referrer,
      outcome: outcomeId,
    };

    const signature = await account.signTypedData({
      domain,
      types,
      message,
      primaryType: "NineLivesPaymaster",
    });

    const { r, s, v } = Signature.from(signature);

    return { r, s, v };
  };

  return { signForPermit };
}
