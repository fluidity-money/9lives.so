import { Signature } from "ethers";
import { destinationChain } from "@/config/chains";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import {
  prepareContractCall,
  simulateTransaction,
  ZERO_ADDRESS,
} from "thirdweb";
import { PaymasterType } from "@/types";
import config from "@/config";

export default function useSignForPaymaster() {
  const chain = useActiveWalletChain();
  const account = useActiveAccount();
  const domain = {
    name: "NineLivesPaymaster",
    version: "1",
    chainId: chain?.id ?? destinationChain.id,
    verifyingContract: process.env.NEXT_PUBLIC_PAYMASTER_ADDR,
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
    ],
  };
  const signForPaymaster = async ({
    tradingAddr,
    amountToSpend,
    deadline,
    referrer = ZERO_ADDRESS,
    minimumBack,
    outcomeId,
    type,
  }: {
    tradingAddr: string;
    referrer?: string;
    amountToSpend: BigInt;
    deadline: number;
    outcomeId?: string;
    type: PaymasterType;
    minimumBack: BigInt;
  }) => {
    if (!chain) throw new Error("No chain is detected");
    if (!account) throw new Error("No account is connected");
    const nonceTx = prepareContractCall({
      contract: config.contracts.fusdc,
      method: "nonces",
      params: [account.address],
    });
    const nonce = await simulateTransaction({ transaction: nonceTx });
    const message = {
      owner: account.address,
      nonce,
      deadline,
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

  return { signForPaymaster };
}
