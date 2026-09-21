import { useAppKitAccount } from "@reown/appkit/react";
import { useSignMessage } from "wagmi";
import { parseSignature } from "viem";
import config from "@/config";
import { requestPublicKey } from "@/providers/graphqlClient";
import {
  checkAndSetSecret,
  create,
  getSecret,
  isCreated,
} from "./useAccount";
import {
  rfqhubCancelAuction,
  rfqhubConcludeAndAggregate,
  rfqhubCreateAccountExec,
  rfqhubCreateAuctionFromOnrampedAmountServerSig,
  rfqhubInspectBundleTaker,
  rfqhubOnramp,
  rfqhubRequestBalance,
  rfqhubRequestOpenAuctions,
  rfqhubSubmitBundleMakerFromOnrampedAmountServerSig,
  RfqhubOutcome,
  RfqhubPermit,
} from "@/providers/rfqhubGraphqlClient";

/**
 * `useRfqhub` — interaction with the Rfqhub (request-for-quote hub) graph.
 *
 * The Rfqhub graph re-uses the same Superposition account-secret system as
 * `useAccount`: the secret stored under the shared account key authorises
 * rfqhub graph calls via the `Authorization: <eoa>:<secret>` header.
 *
 * Every authenticated operation first ensures the account exists and the
 * secret is retrievable (via `checkAndSetSecret`), then hands that secret to
 * the graph call. The underlying request functions live in
 * `providers/rfqhubGraphqlClient`.
 */
export default function useRfqhub() {
  const account = useAppKitAccount();
  const { mutateAsync: signMessage } = useSignMessage();

  const requireAccount = async (): Promise<{
    eoaAddress: string;
    secret: string;
  }> => {
    if (!account.address) throw new Error("No wallet is connected");
    const secret = await checkAndSetSecret(account.address, signMessage);
    if (!secret) throw new Error("No secret is set");
    return { eoaAddress: account.address, secret };
  };

  // ---- Account lifecycle (shared secret system, mirrors `useAccount`) ----
  const ensureSecret = async (): Promise<string> => {
    if (!account.address) throw new Error("No wallet is connected");
    const secret = await checkAndSetSecret(account.address, signMessage);
    if (!secret) throw new Error("No secret is set");
    return secret;
  };

  const createRfqhubAccount = async ({
    amt,
    permit,
    authority,
    isDryrun,
  }: {
    amt: string;
    permit?: RfqhubPermit;
    authority?: string;
    isDryrun?: boolean;
  }) => {
    if (!account.address) throw new Error("No wallet is connected");
    const authAddr = (
      authority ?? config.NEXT_PUBLIC_ACCOUNT_AUTHORITY_ADDR
    )
      .slice(2)
      .toLowerCase();
    const publicKey = await requestPublicKey();
    const message = `New Superposition account: ${publicKey}, authority contract: ${authAddr}`;
    const signature = await signMessage({ message });
    const { r, s, v } = parseSignature(signature);
    return rfqhubCreateAccountExec({
      eoaAddr: account.address.slice(2),
      r: r.slice(2),
      s: s.slice(2),
      v: Number(v),
      authority: authAddr,
      amt,
      permit,
      isDryrun,
    });
  };

  // ---- Rfqhub graph operations (current schema functions) ----
  const onramp = async ({
    amt,
    permit,
    isDryrun,
  }: {
    amt: string;
    permit?: RfqhubPermit;
    isDryrun?: boolean;
  }) => {
    const { eoaAddress, secret } = await requireAccount();
    return rfqhubOnramp({ eoaAddress, secret, amt, permit, isDryrun });
  };

  const createAuction = async ({
    minAmount,
    maxAmount,
    isUp,
    priceTarget,
    outcome,
    expiry,
    deadline,
    minOffer,
  }: {
    minAmount: string;
    maxAmount: string;
    isUp: boolean;
    priceTarget: string;
    outcome: RfqhubOutcome;
    expiry: number;
    deadline: number;
    minOffer: string;
  }) => {
    const { eoaAddress, secret } = await requireAccount();
    return rfqhubCreateAuctionFromOnrampedAmountServerSig({
      eoaAddress,
      secret,
      minAmount,
      maxAmount,
      isUp,
      priceTarget,
      outcome,
      expiry,
      deadline,
      minOffer,
    });
  };

  const submitBundleMaker = async ({
    bundleTakerId,
    minAmount,
    maxAmount,
  }: {
    bundleTakerId: number;
    minAmount: string;
    maxAmount: string;
  }) => {
    const { eoaAddress, secret } = await requireAccount();
    return rfqhubSubmitBundleMakerFromOnrampedAmountServerSig({
      eoaAddress,
      secret,
      bundleTakerId,
      minAmount,
      maxAmount,
    });
  };

  const inspectBundleTaker = async (bundleTakerId: number) => {
    const { eoaAddress, secret } = await requireAccount();
    return rfqhubInspectBundleTaker({ eoaAddress, secret, bundleTakerId });
  };

  const concludeAndAggregate = async (bundleTakerId: number) => {
    const { eoaAddress, secret } = await requireAccount();
    return rfqhubConcludeAndAggregate({ eoaAddress, secret, bundleTakerId });
  };

  const cancelAuction = async (bundleTakerId: number) => {
    const { eoaAddress, secret } = await requireAccount();
    return rfqhubCancelAuction({ eoaAddress, secret, bundleTakerId });
  };

  const requestBalance = async (addr?: string) => {
    const address = addr ?? account.address;
    if (!address) throw new Error("No wallet is connected");
    return rfqhubRequestBalance(address);
  };

  return {
    // account lifecycle (shared with useAccount)
    create,
    getSecret,
    isCreated,
    checkAndSetSecret,
    ensureSecret,
    createRfqhubAccount,
    // graph operations
    onramp,
    createAuction,
    submitBundleMaker,
    inspectBundleTaker,
    concludeAndAggregate,
    cancelAuction,
    requestBalance,
    requestOpenAuctions: rfqhubRequestOpenAuctions,
  };
}