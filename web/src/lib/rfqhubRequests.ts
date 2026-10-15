export const DEFAULT_RFQHUB_WEBSOCKET_URL = "wss://rfqhub-ws.9lives.so/";

export type RfqhubIncomingRequest = {
  id: string;
  accountAddress: string;
  asset: string;
  amount: string;
  minOffer: string | null;
  createdBy: string;
  decayRate: number;
  makerOffer?: string;
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
  | {
      type: "snapshot";
      requests: RfqhubIncomingRequest[];
      matches: RfqhubMakerMatch[];
    }
  | { type: "taker"; request: RfqhubIncomingRequest }
  | { type: "maker"; match: RfqhubMakerMatch }
  | { type: "takers"; requests: RfqhubIncomingRequest[] }
  | { type: "makers"; matches: RfqhubMakerMatch[] };

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
  const minOffer =
    content.min_offer === null ? null : integerString(content.min_offer);
  const createdBy = timestamp(content.created_by);
  const decayRate = content.decay_rate;
  const priceTarget = integerString(content.price_target);
  const outcome = nonEmptyString(content.outcome);
  const deadline = timestamp(content.deadline);
  const expiry = timestamp(content.expiry);

  if (
    !id ||
    !accountAddress ||
    !asset ||
    !amount ||
    minOffer === undefined ||
    !createdBy ||
    typeof decayRate !== "number" ||
    !Number.isFinite(decayRate) ||
    decayRate < 0 ||
    decayRate > 1 ||
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
    createdBy,
    decayRate,
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
  return message?.type === "taker"
    ? [message.request]
    : message?.type === "takers" || message?.type === "snapshot"
      ? message.requests
      : [];
};

export const parseRfqhubMessage = (raw: string): RfqhubMessage | undefined => {
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return undefined;
  }

  const root = asRecord(decoded);
  if (Array.isArray(root?.BundleTakers) && Array.isArray(root?.BundleMakers)) {
    return {
      type: "snapshot",
      requests: root.BundleTakers.flatMap((row) => {
        const request = parseRfqhubRequest(row);
        return request ? [request] : [];
      }),
      matches: root.BundleMakers.flatMap((row) => {
        const match = parseRfqhubMaker(row);
        return match ? [match] : [];
      }),
    };
  }
  if (Array.isArray(root?.BundleTakers)) {
    return {
      type: "takers",
      requests: root.BundleTakers.flatMap((row) => {
        const request = parseRfqhubRequest(row);
        return request ? [request] : [];
      }),
    };
  }
  if (Array.isArray(root?.BundleMakers)) {
    return {
      type: "makers",
      matches: root.BundleMakers.flatMap((row) => {
        const match = parseRfqhubMaker(row);
        return match ? [match] : [];
      }),
    };
  }
  const request = parseRfqhubRequest(root?.BundleTaker);
  if (request) return { type: "taker", request };

  const match = parseRfqhubMaker(root?.BundleMaker);
  return match ? { type: "maker", match } : undefined;
};

const parseRfqhubMaker = (value: unknown): RfqhubMakerMatch | undefined => {
  const maker = asRecord(value);
  const accountAddress = nonEmptyString(maker?.acc_addr);
  const amount = integerString(maker?.amt);
  const bundleTakerId = integerString(maker?.bundle_taker_id);
  return accountAddress && amount && bundleTakerId
    ? { accountAddress, amount, bundleTakerId }
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
          makerOffer: match.amount,
          matchVersion: (request.matchVersion ?? 0) + 1,
        }
      : request,
  );

// Integer base-unit estimate only: the database's numeric calculation is authoritative.
export const estimateRfqhubFloor = (
  request: RfqhubIncomingRequest,
  nowMs = Date.now(),
): bigint => {
  const base = BigInt(request.minOffer ?? "0");
  const elapsed = Math.max(
    0,
    Math.floor(
      (Math.min(nowMs, Date.parse(request.deadline)) -
        Date.parse(request.createdBy)) /
        1000,
    ),
  );
  if (base === BigInt(0) || elapsed === 0 || request.decayRate === 0)
    return base;
  if (request.decayRate === 1) return BigInt(0);
  return BigInt(Math.floor(Number(base) * (1 - request.decayRate) ** elapsed));
};

export const minimumRfqhubOffer = (
  request: RfqhubIncomingRequest,
  nowMs = Date.now(),
): bigint => {
  // Offers must be strictly greater than the decayed floor, including a zero floor.
  const minimum = estimateRfqhubFloor(request, nowMs) + BigInt(1);
  const nextMakerOffer =
    request.makerOffer === undefined
      ? BigInt(0)
      : BigInt(request.makerOffer) + ONE_USDC;
  return minimum > nextMakerOffer ? minimum : nextMakerOffer;
};

export const resolveRfqhubWebsocketUrl = (configuredUrl?: string): string => {
  const url = new URL(configuredUrl ?? DEFAULT_RFQHUB_WEBSOCKET_URL);
  if (url.protocol === "https:") url.protocol = "wss:";
  if (url.protocol === "http:") url.protocol = "ws:";
  return url.toString();
};
