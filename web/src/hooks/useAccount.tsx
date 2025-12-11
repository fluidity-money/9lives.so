import {
  requestEoaForAddress,
  createAccount,
  requestPublicKey,
} from "@/providers/graphqlClient";
import { Signature } from "ethers";
import { useActiveAccount } from "thirdweb/react";

export default function useAccount() {
  const account = useActiveAccount();
  const create = async () => {
    if (!account) throw new Error("No wallet is connected");
    const eoaAddr = await requestEoaForAddress(account?.address);
    const publicKey = await requestPublicKey();
    const signature = await account?.signMessage({ message: `0x${publicKey}` });
    const { r, s, v } = Signature.from(signature);
    return await createAccount({ eoaAddr, r, s, v });
  };

  return { create };
}
