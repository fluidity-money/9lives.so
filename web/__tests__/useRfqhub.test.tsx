import { renderHook } from "@testing-library/react";
import { maxUint256 } from "viem";
import useRfqhub from "../src/hooks/useRfqhub";
import { checkAndSetSecret } from "../src/hooks/useAccount";
import * as accounts from "../src/providers/graphqlClient";
import * as rfq from "../src/providers/rfqhubGraphqlClient";

const wallet = "0xAb00000000000000000000000000000000000001";
const spender = "0x0000000000000000000000000000000000000002";
const signature = `0x${"11".repeat(32)}${"22".repeat(32)}1b`;
const mockSign = jest.fn();
const mockPermit = jest.fn();
const mockRead = jest.fn();
const mockSwitch = jest.fn();
let mockWallet: string | undefined = wallet;
jest.mock("@reown/appkit/react", () => ({
  useAppKitAccount: () => ({ address: mockWallet }),
}));
jest.mock("wagmi", () => ({
  useSignMessage: () => ({ mutateAsync: mockSign }),
  usePublicClient: () => ({ readContract: mockRead }),
}));
jest.mock("../src/hooks/useCheckAndSwitchChain", () => ({
  __esModule: true,
  default: () => ({ checkAndSwitchChain: mockSwitch }),
}));
jest.mock("../src/hooks/useSignForPermit", () => ({
  __esModule: true,
  default: () => ({ signForPermit: mockPermit }),
}));
jest.mock("../src/utils/analytics", () => ({ EVENTS: {}, track: jest.fn() }));
jest.mock("../src/config", () => ({
  __esModule: true,
  default: {
    NEXT_PUBLIC_ACCOUNT_AUTHORITY_ADDR:
      "0x00000000000000000000000000000000000000AA",
    contracts: {
      fusdc: { address: "0x0000000000000000000000000000000000000003", abi: [] },
    },
  },
}));
jest.mock("../src/config/chains", () => ({ destinationChain: { id: 98985 } }));
jest.mock("../src/providers/graphqlClient", () => ({
  requestPublicKey: jest.fn(),
  requestSecret: jest.fn(),
  createAccount: jest.fn(),
  hasCreated: jest.fn(),
  requestEoaForAddress: jest.fn(),
}));
jest.mock("../src/providers/rfqhubGraphqlClient", () => ({
  rfqhubCreateAccountExec: jest.fn(),
  rfqhubOfframp: jest.fn(),
  rfqhubOnramp: jest.fn(),
  rfqhubCreateAuctionServerSig: jest.fn(),
  rfqhubRequestBalance: jest.fn(),
}));

beforeEach(() => {
  mockWallet = wallet;
  jest.resetAllMocks();
  window.localStorage.clear();
  mockSign.mockResolvedValue(signature);
  mockPermit.mockResolvedValue({ r: "permit-r", s: "permit-s", v: BigInt(28) });
  mockRead.mockImplementation(({ functionName }) =>
    Promise.resolve(functionName === "balanceOf" ? BigInt(100) : BigInt(0)),
  );
  jest.mocked(accounts.hasCreated).mockResolvedValue(true);
  jest.mocked(accounts.requestPublicKey).mockResolvedValue("public-key");
  jest.mocked(accounts.requestEoaForAddress).mockResolvedValue(spender);
  jest.mocked(accounts.requestSecret).mockResolvedValue("test-secret");
  jest.mocked(rfq.rfqhubCreateAccountExec).mockResolvedValue(true);
  jest.mocked(rfq.rfqhubOnramp).mockResolvedValue("0xfunding");
});

it("prepares an authenticated offramp without funding or creating an account", async () => {
  const prepared = { cd: "ab", ids: [1] };
  jest.mocked(rfq.rfqhubOfframp).mockResolvedValue(prepared);
  const { result } = renderHook(() => useRfqhub());
  await expect(result.current.offramp("1234567")).resolves.toEqual(prepared);
  expect(rfq.rfqhubOfframp).toHaveBeenCalledWith({
    eoaAddress: wallet,
    secret: "test-secret",
    minAmt: "1234567",
  });
  expect(rfq.rfqhubCreateAccountExec).not.toHaveBeenCalled();
  expect(rfq.rfqhubOnramp).not.toHaveBeenCalled();
});

it("does not create an account for withdrawal and rejects invalid amounts", async () => {
  jest.mocked(accounts.hasCreated).mockResolvedValue(false);
  const { result } = renderHook(() => useRfqhub());
  await expect(result.current.offramp("1")).rejects.toThrow(
    "No RFQHub account",
  );
  for (const amount of ["0", "-1", "1.1", "18446744073709551616"]) {
    await expect(result.current.offramp(amount)).rejects.toThrow(
      "Invalid withdrawal",
    );
  }
  expect(rfq.rfqhubCreateAccountExec).not.toHaveBeenCalled();
  expect(accounts.createAccount).not.toHaveBeenCalled();
  expect(rfq.rfqhubOfframp).not.toHaveBeenCalled();
});

it("refreshes only confirmed 401 once for offramp, not execution or network errors", async () => {
  const prepared = { cd: "ab", ids: [1] };
  jest
    .mocked(rfq.rfqhubOfframp)
    .mockRejectedValueOnce({ response: { status: 401 } })
    .mockResolvedValueOnce(prepared);
  jest
    .mocked(accounts.requestSecret)
    .mockResolvedValueOnce("old")
    .mockResolvedValueOnce("fresh");
  const { result } = renderHook(() => useRfqhub());
  await expect(result.current.offramp("1")).resolves.toEqual(prepared);
  expect(rfq.rfqhubOfframp).toHaveBeenNthCalledWith(2, {
    eoaAddress: wallet,
    secret: "fresh",
    minAmt: "1",
  });
  expect(accounts.requestSecret).toHaveBeenCalledTimes(2);
  jest
    .mocked(rfq.rfqhubOfframp)
    .mockRejectedValueOnce(new Error("network lost"));
  await expect(result.current.offramp("1")).rejects.toThrow("network lost");
  expect(rfq.rfqhubOfframp).toHaveBeenCalledTimes(3);
  expect(accounts.requestSecret).toHaveBeenCalledTimes(2);
});

it("does not send an offramp if the wallet changes during authentication", async () => {
  let resolve!: (value: boolean) => void;
  jest.mocked(accounts.hasCreated).mockImplementationOnce(
    () =>
      new Promise<boolean>((done) => {
        resolve = done;
      }),
  );
  const { result, rerender } = renderHook(() => useRfqhub());
  const pending = result.current.offramp("1");
  mockWallet = "0x0000000000000000000000000000000000000004";
  rerender();
  resolve(true);
  await expect(pending).rejects.toThrow("Wallet changed");
  expect(rfq.rfqhubOfframp).not.toHaveBeenCalled();
});

const suggestion = {
  minAmount: "40",
  maxAmount: "40",
  isUp: true,
  priceTarget: "65000",
  durationSeconds: 300,
  biddingWindowSeconds: 30,
};

it("creates and funds a new account with the permit, recovers the secret and reuses it for prediction", async () => {
  jest.mocked(accounts.hasCreated).mockResolvedValueOnce(false);
  const { result, rerender } = renderHook(() => useRfqhub());
  await expect(result.current.addFunds("40")).resolves.toBe(true);
  expect(rfq.rfqhubCreateAccountExec).toHaveBeenCalledWith(
    expect.objectContaining({
      eoaAddr: wallet.slice(2),
      amt: "40",
      authority: "00000000000000000000000000000000000000aa",
      r: "11".repeat(32),
      s: "22".repeat(32),
      v: 27,
      permit: {
        permitR: "permit-r",
        permitS: "permit-s",
        permitV: 28,
        deadline: expect.any(Number),
      },
    }),
  );
  expect(mockPermit).toHaveBeenCalledWith(
    expect.objectContaining({ spender, amountToSpend: maxUint256 }),
  );
  expect(mockSign).toHaveBeenCalledWith({
    message:
      "New Superposition account: public-key, authority contract: 00000000000000000000000000000000000000aa",
  });
  expect(accounts.requestSecret).toHaveBeenCalledTimes(1);
  rerender();
  await result.current.createSuggestion(suggestion);
  expect(rfq.rfqhubCreateAuctionServerSig).toHaveBeenCalledWith(
    expect.objectContaining({ secret: "test-secret", eoaAddress: wallet }),
  );
  expect(accounts.requestSecret).toHaveBeenCalledTimes(1);
  await expect(checkAndSetSecret(wallet.toLowerCase(), mockSign)).resolves.toBe(
    "test-secret",
  );
  expect(rfq.rfqhubOnramp).not.toHaveBeenCalled();
  expect(accounts.createAccount).not.toHaveBeenCalled();
});

it.each([BigInt(0), BigInt(100)])(
  "keeps existing accounts on onramp with allowance %s",
  async (allowance) => {
    mockRead.mockImplementation(({ functionName }) =>
      Promise.resolve(functionName === "balanceOf" ? BigInt(100) : allowance),
    );
    const { result } = renderHook(() => useRfqhub());
    await result.current.addFunds("40");
    expect(rfq.rfqhubOnramp).toHaveBeenCalledWith(
      expect.objectContaining({
        amt: "40",
        secret: "test-secret",
        permit: allowance
          ? undefined
          : expect.objectContaining({ permitV: 28 }),
      }),
    );
    expect(mockPermit).toHaveBeenCalledTimes(allowance ? 0 : 1);
    expect(rfq.rfqhubCreateAccountExec).not.toHaveBeenCalled();
    expect(accounts.createAccount).not.toHaveBeenCalled();
  },
);

it("omits the permit for a new account with sufficient allowance", async () => {
  jest.mocked(accounts.hasCreated).mockResolvedValue(false);
  mockRead.mockResolvedValue(BigInt(100));
  const { result } = renderHook(() => useRfqhub());
  await result.current.addFunds("40");
  expect(rfq.rfqhubCreateAccountExec).toHaveBeenCalledWith(
    expect.objectContaining({ amt: "40", permit: undefined }),
  );
  expect(mockPermit).not.toHaveBeenCalled();
});

it.each(["false", "reject", "secret"])(
  "does not fall back to generic creation or onramp on %s failure",
  async (failure) => {
    jest.mocked(accounts.hasCreated).mockResolvedValue(false);
    if (failure === "false")
      jest.mocked(rfq.rfqhubCreateAccountExec).mockResolvedValue(false);
    if (failure === "reject")
      jest
        .mocked(rfq.rfqhubCreateAccountExec)
        .mockRejectedValue(new Error("failed"));
    if (failure === "secret")
      jest
        .mocked(accounts.requestSecret)
        .mockRejectedValue(new Error("failed"));
    const { result } = renderHook(() => useRfqhub());
    await expect(result.current.addFunds("40")).rejects.toThrow();
    expect(accounts.createAccount).not.toHaveBeenCalled();
    expect(rfq.rfqhubOnramp).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
    if (failure !== "secret")
      expect(accounts.requestSecret).not.toHaveBeenCalled();
  },
);

it("creates through RFQ without an extra deposit when hub balance covers the prediction", async () => {
  jest.mocked(accounts.hasCreated).mockResolvedValue(false);
  jest.mocked(rfq.rfqhubRequestBalance).mockResolvedValue("100");
  const { result } = renderHook(() => useRfqhub());
  expect(await result.current.requestBalance()).toBe("100");
  await result.current.createSuggestion(suggestion);
  expect(accounts.createAccount).not.toHaveBeenCalled();
  expect(rfq.rfqhubCreateAccountExec).toHaveBeenCalledWith(
    expect.objectContaining({ amt: "0", permit: undefined }),
  );
  expect(rfq.rfqhubCreateAuctionServerSig).toHaveBeenCalledWith(
    expect.objectContaining({ secret: "test-secret", minAmount: "40" }),
  );
  expect(rfq.rfqhubOnramp).not.toHaveBeenCalled();
  expect(mockPermit).not.toHaveBeenCalled();
  expect(mockRead).not.toHaveBeenCalled();
});

it("does not create generically if account existence changes during authentication", async () => {
  jest
    .mocked(accounts.hasCreated)
    .mockResolvedValueOnce(true)
    .mockResolvedValue(false);
  const { result } = renderHook(() => useRfqhub());
  await expect(result.current.createSuggestion(suggestion)).rejects.toThrow(
    "does not exist",
  );
  expect(accounts.createAccount).not.toHaveBeenCalled();
});

it("does not persist or recover a secret for a dry run", async () => {
  const { result } = renderHook(() => useRfqhub());
  await result.current.createRfqhubAccount({ amt: "40", isDryrun: true });
  expect(accounts.requestSecret).not.toHaveBeenCalled();
  expect(window.localStorage.length).toBe(0);
});
