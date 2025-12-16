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
function storeSecret(secret: string) {
  const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
  const FIVE_MINS = 1000 * 60 * 5;
  window.localStorage.setItem(
    "9lives-account-secret",
    JSON.stringify({
      secret,
      expireAt: new Date(Date.now() + ONE_MONTH - FIVE_MINS).toUTCString(),
    }),
  );
}

export default function useAccount() {
  const account = useActiveAccount();
  const create = async () => {
    if (!account) throw new Error("No wallet is connected");
    const publicKey = await requestPublicKey();
    const signature = await account?.signMessage({ message: publicKey });
    const { r, s, v } = Signature.from(signature);
    const response = await createAccount({
      eoaAddr: account.address.slice(2),
      r: r.slice(2),
      s: s.slice(2),
      v,
    });
    if (!response) {
      throw new Error("Account creation failed");
    }
    storeSecret(response.secret);
  };
  const getSecret = async () => {
    if (!account) throw new Error("No wallet is connected");
    const publicKey = await requestPublicKey();
    const nonce = Math.floor(Math.random() * 0x7fffffff);
    const nonceHex = encodeNonceBE(nonce);
    const message = publicKey + nonceHex;
    const signature = await account?.signMessage({ message });
    const { r, s, v } = Signature.from(signature);
    const secret = await requestSecret({
      eoaAddr: account.address.slice(2),
      nonce,
      s: s.slice(2),
      r: r.slice(2),
      v,
    });
    if (!secret) {
      throw new Error("Account secret is not retreived");
    }
    storeSecret(secret);
  };
  const isCreated = async () => {
    if (!account) throw new Error("No wallet is connected");
    return await hasCreated(account.address);
  };

  return { create, getSecret, isCreated };
}
