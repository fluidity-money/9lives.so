import config from "@/config";
import { Rfqhub } from "@/graffle/rfqhub/__";
import { rfqhubRootData } from "@/lib/rfqhub";

/**
 * Rfqhub graph client.
 *
 * The Rfqhub (request-for-quote) hub re-uses the Superposition account secret
 * system: the same `accounts_secrets_2` table that backs `accounts.superposition.so`
 * authorises these graph calls. Operations that spend onramped liquidity use
 * the `Authorization: <eoa>:<secret>` header; public reads do not.
 */
const graphRfqhub = Rfqhub.create({ output: { envelope: true } }).transport({
  url: config.NEXT_PUBLIC_RFQHUB_URL,
});

const withAuth = (eoaAddress: string, secret: string) =>
  graphRfqhub.transport({
    headers: { Authorization: `${eoaAddress}:${secret}` },
  });

const data = <TData extends object, TKey extends keyof TData>(
  request: Promise<{
    response?: { status: number };
    data?: TData | null;
    errors?: readonly unknown[] | null;
  }>,
  rootField: TKey,
) => request.then((envelope) => rfqhubRootData(envelope, rootField));

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
 * Create an account (fresh on the accounts factory) and seed a spendable
 * balance object by onramping `amt` from `bal`. Returns a Boolean, not a
 * secret or transaction hash. After success, recover/cache the shared secret
 * with `getSecret` (in `useAccount`), without triggering generic creation.
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
  data(
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
    }),
    "createAccountExec",
  );

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
  data(
    withAuth(eoaAddress, secret).mutation.onrampAmount({
      $: { amt, permit, isDryrun },
    }),
    "onrampAmount",
  );

/**
 * Create a BundleTaker auction backed by the caller's onramped liquidity. The
 * server signs the BundleTaker arguments on the user's behalf (server-signed),
 * so no client-side signature is needed.
 */
export const rfqhubCreateAuctionServerSig = ({
  eoaAddress,
  secret,
  minAmount,
  maxAmount,
  isUp,
  priceTarget,
  outcome,
  expiry,
  deadline,
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
}) =>
  data(
    withAuth(eoaAddress, secret).mutation.createAuctionServerSig({
      $: {
        minAmount,
        maxAmount,
        isUp,
        priceTarget,
        $outcome: outcome,
        expiry,
        deadline,
      },
      leftoverBal: true,
      amountSpent: true,
      bundleId: true,
    }),
    "createAuctionServerSig",
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
  data(
    withAuth(eoaAddress, secret).mutation.submitBundleMakerServerSig({
      $: { bundleTakerId, minAmount, maxAmount },
      id: true,
      bundleMakerId: true,
    }),
    "submitBundleMakerServerSig",
  );

/** Prepare whole winning bundles covering minAmt (micro-USDC), not a transaction. */
export const rfqhubOfframp = ({
  eoaAddress,
  secret,
  minAmt,
}: {
  eoaAddress: string;
  secret: string;
  minAmt: string;
}) =>
  data(
    withAuth(eoaAddress, secret).mutation.offramp({
      $: { minAmt },
      cd: true,
      ids: true,
    }),
    "offramp",
  ).then((result) => {
    if (
      !result ||
      !/^(?:0x)?(?:[0-9a-fA-F]{2})+$/.test(result.cd) ||
      !result.ids?.length ||
      result.ids.some((id) => !Number.isSafeInteger(id) || id <= 0)
    )
      throw new Error(
        "RFQHub returned unusable withdrawal preparation; check the request before retrying",
      );
    return result;
  });

export type RfqhubOfframpResult = Awaited<ReturnType<typeof rfqhubOfframp>>;

/**
 * Get the spendable onramped balance for an account address. Public.
 */
export const rfqhubRequestBalance = (addr: string) =>
  data(graphRfqhub.query.balance({ $: { addr } }), "balance");

/**
 * Get the currently outstanding auctions needing BundleMaker submissions.
 * Public.
 */
export const rfqhubRequestOpenAuctions = () =>
  data(
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
    }),
    "openAuctions",
  );
