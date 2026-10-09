export type RfqhubSuggestionDurations = {
  durationSeconds: number;
  biddingWindowSeconds: number;
  nowSeconds?: number;
};

type RfqhubCredentials = {
  eoaAddress: string;
  secret: string;
};

type RfqhubEnvelope<T> = {
  // Graffle's HTTP transport attaches the Response in its decode pipeline,
  // but the generated envelope type currently omits it (see Graffle's
  // RequestPipeline decode step). Keep this optional so generated operation
  // results remain assignable while still preserving HTTP status at runtime.
  response?: { status: number };
  data?: T | null;
  errors?: readonly unknown[] | null;
};

class RfqhubHttpError extends Error {
  constructor(public readonly status: number) {
    super(`RFQ Hub request failed with HTTP ${status}`);
  }
}

export const rfqhubData = <T>({
  response,
  data,
  errors,
}: RfqhubEnvelope<T>): T => {
  if (response && (response.status < 200 || response.status >= 300)) {
    throw new RfqhubHttpError(response.status);
  }
  if (errors?.length) {
    const messages = errors.map((error) =>
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error),
    );
    throw new Error(messages.join("; "));
  }
  if (data == null) {
    throw new Error("RFQ Hub returned no data");
  }
  return data;
};

export const rfqhubRootData = <TData extends object, TKey extends keyof TData>(
  envelope: RfqhubEnvelope<TData>,
  rootField: TKey,
): TData[TKey] => rfqhubData(envelope)[rootField];

type RfqhubAuthenticatedRequest<T> = {
  eoaAddress: string;
  secret: string;
  refreshSecret: () => Promise<string>;
  request: (credentials: RfqhubCredentials) => Promise<T>;
};

const responseStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const value = error as {
    status?: unknown;
    response?: { status?: unknown };
    cause?: unknown;
  };
  if (typeof value.status === "number") return value.status;
  if (typeof value.response?.status === "number") return value.response.status;
  return responseStatus(value.cause);
};

export const executeRfqhubAuthenticated = async <T>({
  eoaAddress,
  secret,
  refreshSecret,
  request,
}: RfqhubAuthenticatedRequest<T>) => {
  try {
    return await request({ eoaAddress, secret });
  } catch (error) {
    if (responseStatus(error) !== 401) throw error;
    const refreshedSecret = await refreshSecret();
    return request({ eoaAddress, secret: refreshedSecret });
  }
};

export const rfqhubSuggestionTimestamps = ({
  durationSeconds,
  biddingWindowSeconds,
  nowSeconds = Math.floor(Date.now() / 1_000),
}: RfqhubSuggestionDurations) => {
  if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
    throw new Error(
      "Option duration must be a positive whole number of seconds",
    );
  }
  if (!Number.isInteger(biddingWindowSeconds) || biddingWindowSeconds <= 0) {
    throw new Error(
      "Bidding window must be a positive whole number of seconds",
    );
  }
  if (biddingWindowSeconds > durationSeconds) {
    throw new Error("Bidding window cannot end after option expiry");
  }
  if (!Number.isInteger(nowSeconds) || nowSeconds < 0) {
    throw new Error("Current time must be a non-negative Unix timestamp");
  }

  const expiry = nowSeconds + durationSeconds;
  if (expiry > 2_147_483_647) {
    throw new Error("Option expiry exceeds the GraphQL Int timestamp range");
  }

  return {
    expiry,
    deadline: nowSeconds + biddingWindowSeconds,
  };
};
