import config from "@/config";
import { Rfqhub } from "@/graffle/rfqhub/__";

/**
 * Rfqhub graph client.
 *
 * The Rfqhub (request-for-quote) hub re-uses the Superposition account secret
 * system: the same `accounts_secrets_2` table that backs `accounts.superposition.so`
 * authorises these graph calls. Any operation that spends onramped liquidity
 * (onramp, auction creation, bundle maker submission, conclude, cancel, inspect)
 * requires the `Authorization: <eoa>:<secret>` header to be present.
 */
const graphRfqhub = Rfqhub.create().transport({
  url: config.NEXT_PUBLIC_RFQHUB_URL,
});

const withAuth = (eoaAddress: string, secret: string) =>
  graphRfqhub.transport({
    headers: { Authorization: `${eoaAddress}:${secret}` },
  });

export type RfqhubOutcome = Rfqhub.SelectionSets.Outcome;

/**
 * Permit produced by the accounts system, granting a spender allowance.
 * Mirrors the permit shape used by `useSignForPermit` / `useAccount`.
 */
export type RfqhubPermit = {
  deadline: number;
  permitV: number;
  permitR: string;
  permitS: string;
};

/**
 * Signature components for wallet-signed account creation.
 */
type AccountSig = {
  r: string;
  s: string;
  v: number;
};

/**
 * Create an account (fresh on the accounts factory) and seed a spendable
 * balance object by onramping `amt` from `bal`. Returns nothing on success;
 * throws on failure. NOTE: this returns a `Boolean` (not the secret) — the
 * secret for the Rfqhub graph is the shared Superposition account secret, so
 * prefer `checkAndSetSecret` (in `useAccount`) for obtaining it.
 */
export const rfqhubCreateAccountExec = ({
  eoaAddr,
  r,
  s,
  v,
  authority,
  amt,
  permit,
  isDryrun,
}: {
  eoaAddr: string;
  r: string;
  s: string;
  v: number;
  authority?: string;
  amt: string;
  permit?: RfqhubPermit;
  isDryrun?: boolean;
}) =>
  graphRfqhub.mutation.createAccountExec({
    $: {
      createAccount: {
        eoa_addr: eoaAddr,
        sigR: r,
        sigS: s,
        sigV: v,
        authority,
      },
      permit,
      amt,
      isDryrun,
    },
  });

/**
 * Onramp an amount (from the user's `bal`) into spendable Rfqhub liquidity
 * using the router. Authenticated with the account secret.
 */
export const rfqhubOnramp = ({
  eoaAddress,
  secret,
  amt,
  permit,
  isDryrun,
}: {
  eoaAddress: string;
  secret: string;
  amt: string;
  permit?: RfqhubPermit;
  isDryrun?: boolean;
}) =>
  withAuth(eoaAddress, secret).mutation.onrampAmount({
    $: { amt, permit, isDryrun },
  });

/**
 * Create a BundleTaker auction backed by the caller's onramped liquidity. The
 * server signs the BundleTaker arguments on the user's behalf (server-signed),
 * so no client-side signature is needed.
 */
export const rfqhubCreateAuctionFromOnrampedAmountServerSig = ({
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
}: {
  eoaAddress: string;
  secret: string;
  minAmount: string;
  maxAmount: string;
  isUp: boolean;
  priceTarget: string;
  outcome: RfqhubOutcome;
  expiry: number;
  deadline: number;
  minOffer: string;
}) =>
  withAuth(eoaAddress, secret).mutation.createAuctionFromOnrampedAmountServerSig(
    {
      $: {
        minAmount,
        maxAmount,
        isUp,
        priceTarget,
        $outcome: outcome,
        expiry,
        deadline,
        minOffer,
      },
      leftoverBal: true,
      amountSpent: true,
      bundleId: true,
    },
  );

/**
 * Submit a BundleMaker against a live BundleTaker auction, spending the
 * caller's onramped liquidity. Server-signed.
 */
export const rfqhubSubmitBundleMakerFromOnrampedAmountServerSig = ({
  eoaAddress,
  secret,
  bundleTakerId,
  minAmount,
  maxAmount,
}: {
  eoaAddress: string;
  secret: string;
  bundleTakerId: number;
  minAmount: string;
  maxAmount: string;
}) =>
  withAuth(eoaAddress, secret).mutation.submitBundleMakerFromOnrampedAmountServerSig(
    {
      $: { bundleTakerId, minAmount, maxAmount },
      id: true,
      bundleMakerId: true,
    },
  );

/**
 * Query the status of an auction the caller created. Owner-only.
 */
export const rfqhubInspectBundleTaker = ({
  eoaAddress,
  secret,
  bundleTakerId,
}: {
  eoaAddress: string;
  secret: string;
  bundleTakerId: number;
}) =>
  withAuth(eoaAddress, secret).mutation.inspectBundleTakerId({
    $: { bundleTakerId },
    id: true,
    concluded: true,
    cancelled: true,
    earned: true,
  });

/**
 * Permanently mark one side of an aggregate bundle as consumed and receive a
 * server signature for the aggregate. Server-signed.
 */
export const rfqhubConcludeAndAggregate = ({
  eoaAddress,
  secret,
  bundleTakerId,
}: {
  eoaAddress: string;
  secret: string;
  bundleTakerId: number;
}) =>
  withAuth(eoaAddress, secret).mutation.concludeAndAggregate({
    $: { bundleTakerId },
    id: true,
    takerWon: true,
    bundleTaker: {
      id: true,
    },
    bundleMaker: {
      id: true,
    },
  });

/**
 * Cancel an auction the caller created (within the one-minute window).
 */
export const rfqhubCancelAuction = ({
  eoaAddress,
  secret,
  bundleTakerId,
}: {
  eoaAddress: string;
  secret: string;
  bundleTakerId: number;
}) =>
  withAuth(eoaAddress, secret).mutation.cancelAuction({
    $: { bundleTakerId },
  });

/**
 * Get the spendable onramped balance for an account address. Public.
 */
export const rfqhubRequestBalance = (addr: string) =>
  graphRfqhub.query.balance({ $: { addr } });

/**
 * Get the currently outstanding auctions needing BundleMaker submissions.
 * Public.
 */
export const rfqhubRequestOpenAuctions = () =>
  graphRfqhub.query.openAuctions({
    id: true,
    openAuctions: {
      id: true,
      openToBeWon: true,
      accAddr: true,
      deadlineTs: true,
      outcome: true,
      expiryTs: true,
      priceTarget: true,
      isUp: true,
      bundleTakerId: true,
    },
  });