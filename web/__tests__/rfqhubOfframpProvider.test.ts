import { rfqhubOfframp } from "../src/providers/rfqhubGraphqlClient";
const mockOfframp = jest.fn();
const mockTransport = jest.fn();
jest.mock("../src/config", () => ({
  __esModule: true,
  default: { NEXT_PUBLIC_RFQHUB_URL: "https://example.invalid/graphql" },
}));
jest.mock("../src/graffle/rfqhub/__", () => ({
  Rfqhub: {
    create: () => ({
      transport: () => {
        return {
          transport: (...auth: unknown[]) => {
            mockTransport(...auth);
            return { mutation: { offramp: mockOfframp } };
          },
        };
      },
    }),
  },
}));
beforeEach(() => jest.clearAllMocks());
it("selects calldata and IDs, sends exact minAmt with account authorization and unwraps the root", async () => {
  const prepared = { cd: "aabb", ids: [3, 7] };
  mockOfframp.mockResolvedValue({
    response: { status: 200 },
    data: { offramp: prepared },
  });
  await expect(
    rfqhubOfframp({ eoaAddress: "0xabc", secret: "secret", minAmt: "1234567" }),
  ).resolves.toEqual(prepared);
  expect(mockTransport).toHaveBeenCalledWith({
    headers: { Authorization: "0xabc:secret" },
  });
  expect(mockOfframp).toHaveBeenCalledWith({
    $: { minAmt: "1234567" },
    cd: true,
    ids: true,
  });
});
it("does not swallow GraphQL failures or repeat mutations", async () => {
  mockOfframp.mockResolvedValue({
    response: { status: 200 },
    errors: [{ message: "no bundles" }],
  });
  await expect(
    rfqhubOfframp({ eoaAddress: "0xabc", secret: "secret", minAmt: "1" }),
  ).rejects.toThrow("no bundles");
  expect(mockOfframp).toHaveBeenCalledTimes(1);
});
