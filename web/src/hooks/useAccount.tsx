import {
  requestEoaForAddress,
  createAccount,
  requestPublicKey,
  requestSecret,
} from "@/providers/graphqlClient";
import { Signature } from "ethers";
import { useActiveAccount } from "thirdweb/react";
import { hasCreated } from "../providers/graphqlClient";

function encodeNonceBE(nonce: number): string {
  const buf = new Uint8Array(4);
  const view = new DataView(buf.buffer);
  view.setUint32(0, nonce, false);
  return Buffer.from(buf).toString("hex");
}

export default function useAccount() {
  const account = useActiveAccount();
  const create = async () => {
    if (!account) throw new Error("No wallet is connected");
    const publicKey = await requestPublicKey();
    const signature = await account?.signMessage({ message: publicKey });
    const { r, s, v } = Signature.from(signature);
    return await createAccount({
      eoaAddr: account.address.slice(2),
      r: r.slice(2),
      s: s.slice(2),
      v,
    });
  };
  const getSecret = async () => {
    if (!account) throw new Error("No wallet is connected");
    const publicKey = await requestPublicKey();
    const nonce = Math.floor(Math.random() * 0x7fffffff);
    const nonceHex = encodeNonceBE(nonce);
    const message = publicKey + nonceHex;
    const signature = await account?.signMessage({ message });
    const { r, s, v } = Signature.from(signature);
    return await requestSecret({
      eoaAddr: account.address.slice(2),
      nonce,
      s: s.slice(2),
      r: r.slice(2),
      v,
    });
  };
  const isCreated = async () => {
    if (!account) throw new Error("No wallet is connected");
    return await hasCreated(account.address);
  };

  return { create, getSecret, isCreated };
}
