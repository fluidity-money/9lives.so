export const DEFAULT_RFQHUB_WEBSOCKET_URL = "wss://rfqhub-ws.9lives.so/";

export type RfqhubIncomingRequest = {
  id: string;
  accountAddress: string;
  asset: string;
  amount: string;
  minOffer: string;
  isUp: boolean;
  priceTarget: string;
  outcome: string;
  deadline: string;
  expiry: string;
  structure: {
    args: Record<string, unknown>;
    sig: unknown[];
  };
  matchVersion?: number;
};

export type RfqhubMakerMatch = {
  accountAddress: string;
  amount: string;
  bundleTakerId: string;
};

export type RfqhubMessage =
  | { type: "taker"; request: RfqhubIncomingRequest }
  | { type: "maker"; match: RfqhubMakerMatch };

const ONE_USDC = BigInt(1_000_000);

export const filterActiveRfqhubRequests = (
  requests: RfqhubIncomingRequest[],
  nowMs = Date.now(),
): RfqhubIncomingRequest[] =>
  requests.filter((request) => Date.parse(request.deadline) > nowMs);

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const nonEmptyString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const integerString = (value: unknown): string | undefined => {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value >= 0
      ? String(value)
      : undefined;
  }
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  return BigInt(value).toString();
};

const timestamp = (value: unknown): string | undefined => {
  const result = nonEmptyString(value);
  return result && Number.isFinite(Date.parse(result)) ? result : undefined;
};

export const parseRfqhubRequest = (
  value: unknown,
): RfqhubIncomingRequest | undefined => {
  const content = asRecord(value);
  const structure = asRecord(content?.structure);
  const args = asRecord(structure?.args);
  const sig = structure?.sig;
  if (!content || !structure || !args || !Array.isArray(sig)) return undefined;

  const id = integerString(content.id);
  const accountAddress = nonEmptyString(content.acc_addr);
  const asset = nonEmptyString(content.asset);
  const amount = integerString(content.amt);
  const minOffer = integerString(content.min_offer);
  const priceTarget = integerString(content.price_target);
  const outcome = nonEmptyString(content.outcome);
  const deadline = timestamp(content.deadline);
  const expiry = timestamp(content.expiry);

  if (
    !id ||
    !accountAddress ||
    !asset ||
    !amount ||
    !minOffer ||
    typeof content.is_up !== "boolean" ||
    !priceTarget ||
    !outcome ||
    !deadline ||
    !expiry
  ) {
    return undefined;
  }

  return {
    id,
    accountAddress,
    asset,
    amount,
    minOffer,
    isUp: content.is_up,
    priceTarget,
    outcome,
    deadline,
    expiry,
    structure: { args, sig },
  };
};

export const parseRfqhubRequestMessage = (
  raw: string,
): RfqhubIncomingRequest[] => {
  const message = parseRfqhubMessage(raw);
  return message?.type === "taker" ? [message.request] : [];
};

export const parseRfqhubMessage = (raw: string): RfqhubMessage | undefined => {
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return undefined;
  }

  const root = asRecord(decoded);
  const request = parseRfqhubRequest(root?.BundleTaker);
  if (request) return { type: "taker", request };

  const maker = asRecord(root?.BundleMaker);
  const accountAddress = nonEmptyString(maker?.acc_addr);
  const amount = integerString(maker?.amt);
  const bundleTakerId = integerString(maker?.bundle_taker_id);
  return accountAddress && amount && bundleTakerId
    ? {
        type: "maker",
        match: { accountAddress, amount, bundleTakerId },
      }
    : undefined;
};

export const applyRfqhubMakerMatch = (
  requests: RfqhubIncomingRequest[],
  match: RfqhubMakerMatch,
): RfqhubIncomingRequest[] =>
  requests.map((request) =>
    request.id === match.bundleTakerId
      ? {
          ...request,
          minOffer: (BigInt(match.amount) + ONE_USDC).toString(),
          matchVersion: (request.matchVersion ?? 0) + 1,
        }
      : request,
  );

export const resolveRfqhubWebsocketUrl = (configuredUrl?: string): string => {
  const url = new URL(configuredUrl ?? DEFAULT_RFQHUB_WEBSOCKET_URL);
  if (url.protocol === "https:") url.protocol = "wss:";
  if (url.protocol === "http:") url.protocol = "ws:";
  return url.toString();
};
