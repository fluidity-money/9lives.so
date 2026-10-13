const RFQHUB_REQUESTS_TABLE = "rfqhub_bundles_maker_1";

export type RfqhubIncomingRequest = {
  id: string;
  bundleTakerId: number;
  amount: string;
  createdAt?: string;
  accountAddress?: string;
};

type TableMessage = {
  table?: unknown;
  content?: unknown;
  snapshot?: unknown;
  snapshot_toplevel?: unknown;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const stringValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
};

export const parseRfqhubRequest = (
  value: unknown,
): RfqhubIncomingRequest | undefined => {
  const content = asRecord(value);
  if (!content) return undefined;

  const id = stringValue(content.id);
  const bundleTakerId = Number(
    content.bundle_taker_id ?? content.bundleTakerId,
  );
  const amount = stringValue(content.amt ?? content.amount);
  if (!id || !Number.isInteger(bundleTakerId) || bundleTakerId < 0 || !amount) {
    return undefined;
  }

  return {
    id,
    bundleTakerId,
    amount,
    createdAt: stringValue(content.created_by ?? content.createdAt),
    accountAddress: stringValue(content.acc_addr ?? content.accountAddress),
  };
};

export const parseRfqhubRequestMessage = (
  raw: string,
): RfqhubIncomingRequest[] => {
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return [];
  }

  const root = asRecord(decoded) as TableMessage | undefined;
  if (!root) return [];

  const messages: TableMessage[] = [];
  if (Array.isArray(root.snapshot_toplevel)) {
    messages.push(...(root.snapshot_toplevel as TableMessage[]));
  } else {
    messages.push(root);
  }

  return messages.flatMap((message) => {
    if (message.table !== RFQHUB_REQUESTS_TABLE) return [];
    const values = Array.isArray(message.snapshot)
      ? message.snapshot
      : [message.content];
    return values.flatMap((value) => {
      const request = parseRfqhubRequest(value);
      return request ? [request] : [];
    });
  });
};

export { RFQHUB_REQUESTS_TABLE };
