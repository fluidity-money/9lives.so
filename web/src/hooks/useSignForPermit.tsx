import { Signature } from "ethers";
import { destinationChain } from "@/config/chains";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import config from "@/config";

export default function useSignForPermit() {
  const chain = useActiveWalletChain();
  const account = useActiveAccount();
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
    amountToSpend: BigInt;
    deadline: number;
  }) => {
    if (!chain) throw new Error("No chain is detected");
    if (!account) throw new Error("No account is connected");
    const nameTx = prepareContractCall({
      contract: config.contracts.fusdc,
      method: "name",
      params: [],
    });
    const name = await simulateTransaction({ transaction: nameTx });
    const nonceTx = prepareContractCall({
      contract: config.contracts.fusdc,
      method: "nonces",
      params: [account.address],
    });
    const nonce = await simulateTransaction({ transaction: nonceTx });
    const domain = {
      name,
      version: "2",
      chainId: destinationChain.id,
      verifyingContract: process.env.NEXT_PUBLIC_FUSDC_ADDR,
    };

    const message = {
      owner: account.address,
      spender,
      value: amountToSpend,
      nonce,
      deadline,
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
