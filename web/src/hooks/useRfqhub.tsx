import { useLayoutEffect, useRef } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePublicClient, useSignMessage } from "wagmi";
import { maxUint256, parseSignature } from "viem";
import config from "@/config";
import { destinationChain } from "@/config/chains";
import {
  requestEoaForAddress,
  requestPublicKey,
} from "@/providers/graphqlClient";
import useCheckAndSwitchChain from "./useCheckAndSwitchChain";
import useSignForPermit from "./useSignForPermit";
import { checkAndSetSecret, create, getSecret, isCreated } from "./useAccount";
import {
  rfqhubOfframp,
  rfqhubCreateAccountExec,
  rfqhubCreateAuctionServerSig,
  rfqhubOnramp,
  rfqhubRequestBalance,
  rfqhubRequestOpenAuctions,
  rfqhubSubmitBundleMakerFromOnrampedAmountServerSig,
  RfqhubOutcome,
  RfqhubPermit,
} from "@/providers/rfqhubGraphqlClient";
import {
  executeRfqhubAuthenticated,
  rfqhubSuggestionTimestamps,
} from "@/lib/rfqhub";

/**
 * `useRfqhub` — interaction with the Rfqhub (request-for-quote hub) graph.
 *
 * The Rfqhub graph re-uses the same Superposition account-secret system as
 * `useAccount`: the secret stored under the shared account key authorises
 * rfqhub graph calls via the `Authorization: <eoa>:<secret>` header.
 *
 * Authenticated spending ensures an account exists through RFQ and retrieves
 * its secret without generic creation. Withdrawal preparation instead requires
 * an existing account and never creates one. The request functions live in
 * `providers/rfqhubGraphqlClient`.
 */
export default function useRfqhub() {
  const account = useAppKitAccount();
  const walletRef = useRef(account.address);
  useLayoutEffect(() => {
    walletRef.current = account.address;
  }, [account.address]);
  const { mutateAsync: signMessage } = useSignMessage();
  const publicClient = usePublicClient({ chainId: destinationChain.id });
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const { signForPermit } = useSignForPermit(account.address);

  const requireAccount = async (): Promise<{
    eoaAddress: string;
    secret: string;
  }> => {
    if (!account.address) throw new Error("No wallet is connected");
    // A wallet may already have enough hub balance and skip addFunds.
    // Create through RFQ with no extra deposit in that case, never generically.
    if (!(await isCreated(account.address))) {
      await checkAndSwitchChain();
      await createRfqhubAccount({ amt: "0" });
    }
    const secret = await checkAndSetSecret(account.address, signMessage, false);
    if (!secret) throw new Error("No secret is set");
    return { eoaAddress: account.address, secret };
  };

  const authenticated = async <T,>(
    request: (credentials: {
      eoaAddress: string;
      secret: string;
    }) => Promise<T>,
  ) => {
    const { eoaAddress, secret } = await requireAccount();
    return executeRfqhubAuthenticated({
      eoaAddress,
      secret,
      refreshSecret: () => getSecret(eoaAddress, signMessage),
      request,
    });
  };

  // ---- Account lifecycle (shared secret system, mirrors `useAccount`) ----
  const ensureSecret = async (): Promise<string> => {
    return (await requireAccount()).secret;
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
    const authAddr = (authority ?? config.NEXT_PUBLIC_ACCOUNT_AUTHORITY_ADDR)
      .slice(2)
      .toLowerCase();
    const publicKey = await requestPublicKey();
    const message = `New Superposition account: ${publicKey}, authority contract: ${authAddr}`;
    const signature = await signMessage({ message });
    const { r, s, v } = parseSignature(signature);
    const created = await rfqhubCreateAccountExec({
      eoaAddr: account.address.slice(2),
      r: r.slice(2),
      s: s.slice(2),
      v: Number(v),
      authority: authAddr,
      amt,
      permit,
      isDryrun,
    });
    if (!created) throw new Error("RFQ Hub account creation failed");
    // The API returns only a Boolean, with no secret or receipt hash. Recover
    // the shared secret explicitly (and cache it), never via generic creation.
    if (!isDryrun) await getSecret(account.address, signMessage);
    return created;
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
  }) =>
    authenticated(({ eoaAddress, secret }) =>
      rfqhubOnramp({ eoaAddress, secret, amt, permit, isDryrun }),
    );

  const requestOnchainBalance = async () => {
    if (!account.address) throw new Error("No wallet is connected");
    if (!publicClient) throw new Error("No public client is set");
    const balance = await publicClient.readContract({
      ...config.contracts.fusdc,
      functionName: "balanceOf",
      args: [account.address as `0x${string}`],
    });
    return balance.toString();
  };

  const addFunds = async (amt: string) => {
    if (!account.address) throw new Error("No wallet is connected");
    if (!publicClient) throw new Error("No public client is set");
    const amount = BigInt(amt);
    if (amount <= BigInt(0))
      throw new Error("Amount must be greater than zero");

    await checkAndSwitchChain();
    const userBalance = BigInt(await requestOnchainBalance());
    if (amount > userBalance) throw new Error("You don't have enough USDC");

    const spender = await requestEoaForAddress(account.address);
    const allowance = await publicClient.readContract({
      ...config.contracts.fusdc,
      functionName: "allowance",
      args: [account.address as `0x${string}`, spender as `0x${string}`],
    });

    let permit: RfqhubPermit | undefined;
    if (amount > allowance) {
      const deadline = Math.floor(Date.now() / 1_000) + 3_600;
      const { r, s, v } = await signForPermit({
        spender,
        amountToSpend: maxUint256,
        deadline,
      });
      permit = {
        permitR: r,
        permitS: s,
        permitV: Number(v),
        deadline,
      };
    }

    const accountExists = await isCreated(account.address);
    return accountExists
      ? onramp({ amt, permit })
      : createRfqhubAccount({ amt, permit });
  };

  const createAuction = async ({
    minAmount,
    maxAmount,
    isUp,
    priceTarget,
    outcome,
    expiry,
    deadline,
  }: {
    minAmount: string;
    maxAmount: string;
    isUp: boolean;
    priceTarget: string;
    outcome: RfqhubOutcome;
    expiry: number;
    deadline: number;
  }) =>
    authenticated(({ eoaAddress, secret }) =>
      rfqhubCreateAuctionServerSig({
        eoaAddress,
        secret,
        minAmount,
        maxAmount,
        isUp,
        priceTarget,
        outcome,
        expiry,
        deadline,
      }),
    );

  const createSuggestion = async ({
    minAmount,
    maxAmount,
    isUp,
    priceTarget,
    durationSeconds,
    biddingWindowSeconds,
  }: {
    minAmount: string;
    maxAmount: string;
    isUp: boolean;
    priceTarget: string;
    durationSeconds: number;
    biddingWindowSeconds: number;
  }) => {
    const { expiry, deadline } = rfqhubSuggestionTimestamps({
      durationSeconds,
      biddingWindowSeconds,
    });
    return createAuction({
      minAmount,
      maxAmount,
      isUp,
      priceTarget,
      outcome: "BitcoinPrice",
      expiry,
      deadline,
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
  }) =>
    authenticated(({ eoaAddress, secret }) =>
      rfqhubSubmitBundleMakerFromOnrampedAmountServerSig({
        eoaAddress,
        secret,
        bundleTakerId,
        minAmount,
        maxAmount,
      }),
    );

  const offramp = async (minAmt: string) => {
    const eoaAddress = account.address;
    if (!eoaAddress) throw new Error("No wallet is connected");
    if (
      !/^\d+$/.test(minAmt) ||
      BigInt(minAmt) <= BigInt(0) ||
      BigInt(minAmt) > BigInt("18446744073709551615")
    )
      throw new Error("Invalid withdrawal amount");
    const assertWallet = () => {
      if (walletRef.current?.toLowerCase() !== eoaAddress.toLowerCase())
        throw new Error(
          "Wallet changed; reopen withdrawal for the connected wallet",
        );
    };
    // Withdrawals must never create an empty account.
    if (!(await isCreated(eoaAddress)))
      throw new Error("No RFQHub account exists");
    assertWallet();
    const secret = await checkAndSetSecret(eoaAddress, signMessage, false);
    assertWallet();
    if (!secret) throw new Error("No secret is set");
    return executeRfqhubAuthenticated({
      eoaAddress,
      secret,
      refreshSecret: () => {
        assertWallet();
        return getSecret(eoaAddress, signMessage);
      },
      request: (credentials) => {
        assertWallet();
        return rfqhubOfframp({ ...credentials, minAmt });
      },
    });
  };

  const requestBalance = async (addr?: string) => {
    const address = addr ?? account.address;
    if (!address) throw new Error("No wallet is connected");
    return rfqhubRequestBalance(address);
  };

  return {
    accountAddress: account.address,
    // account lifecycle (shared with useAccount)
    create,
    getSecret,
    isCreated,
    checkAndSetSecret,
    ensureSecret,
    createRfqhubAccount,
    // graph operations
    onramp,
    addFunds,
    createAuction,
    createSuggestion,
    submitBundleMaker,
    offramp,
    requestBalance,
    requestOnchainBalance,
    requestOpenAuctions: rfqhubRequestOpenAuctions,
  };
}
