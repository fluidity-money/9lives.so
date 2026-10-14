import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RfqhubPrototype from "@/components/rfqhub/rfqhubPrototype";
import NavigationMenu from "@/components/v2/navigationMenu";
import useFeatureFlag from "../src/hooks/useFeatureFlag";
import useRfqhub from "../src/hooks/useRfqhub";
import useRfqhubRequests from "../src/hooks/useRfqhubRequests";
import type { SimpleCampaignDetail } from "@/types";

jest.mock("../src/hooks/useFeatureFlag", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../src/hooks/useRfqhub", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock("../src/hooks/useRfqhubRequests", () => ({
  __esModule: true,
  default: jest.fn(() => ({ requests: [], connectionStatus: "connecting" })),
}));

jest.mock("../src/components/v2/chartWrapper", () => ({
  __esModule: true,
  default: () => <div data-testid="live-btc-chart" />,
}));

jest.mock("../src/components/pointsMenuButton", () => ({
  __esModule: true,
  default: () => null,
}));

const campaignData = {
  priceMetadata: { baseAsset: "btc", priceTargetForUp: "65000" },
} as unknown as SimpleCampaignDetail;

const mockedUseFeatureFlag = jest.mocked(useFeatureFlag);
const mockedUseRfqhub = jest.mocked(useRfqhub);
const mockedUseRfqhubRequests = jest.mocked(useRfqhubRequests);
const requestBalance = jest.fn();
const requestOnchainBalance = jest.fn();
const createSuggestion = jest.fn();
const concludedCalldata = jest.fn();
const addFunds = jest.fn();
const submitBundleMaker = jest.fn();

beforeEach(() => {
  window.localStorage.clear();
  requestBalance.mockReset().mockResolvedValue("50000000");
  requestOnchainBalance.mockReset().mockResolvedValue("50000000");
  createSuggestion.mockReset().mockResolvedValue({
    amountSpent: "50000000",
    bundleId: 7,
    leftoverBal: "0",
  });
  concludedCalldata.mockReset().mockResolvedValue("0x1234");
  addFunds.mockReset().mockResolvedValue("0xfunding");
  submitBundleMaker.mockReset().mockResolvedValue({ id: 9, bundleMakerId: 3 });
  mockedUseRfqhub.mockReturnValue({
    accountAddress: "0x1234",
    requestBalance,
    requestOnchainBalance,
    createSuggestion,
    concludedCalldata,
    addFunds,
    submitBundleMaker,
  } as unknown as ReturnType<typeof useRfqhub>);
  mockedUseRfqhubRequests.mockReturnValue({
    requests: [],
    connectionStatus: "connected",
  });
});

describe("RfqhubPrototype", () => {
  it("prefills the stake from the combined RFQHub and wallet balances", async () => {
    requestBalance.mockResolvedValue("10000000");
    render(<RfqhubPrototype campaignData={campaignData} />);

    expect(mockedUseRfqhub.mock.calls.length).toBeGreaterThan(0);
    expect(screen.getByTestId("live-btc-chart")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Make a prediction" }),
    ).not.toBeNull();
    expect(screen.getByText("With $")).not.toBeNull();
    expect(screen.getByText(", I predict that")).not.toBeNull();
    const predictionAmount = await screen.findByLabelText("Prediction amount");
    await waitFor(() =>
      expect((predictionAmount as HTMLInputElement).value).toBe("60"),
    );
    expect((screen.getByLabelText("Asset") as HTMLSelectElement).value).toBe(
      "BTC",
    );
    expect(
      (screen.getByLabelText("Direction") as HTMLSelectElement).value,
    ).toBe("up");
    expect((screen.getByLabelText("Duration") as HTMLSelectElement).value).toBe(
      "5",
    );
    expect(screen.queryByLabelText("Winnings amount")).toBeNull();
    expect(screen.getByTestId("prediction-sentence").textContent).toContain(
      ", and I want $120 if I win.",
    );
    expect(screen.queryByRole("button", { name: "Add funds" })).toBeNull();
    expect(
      (
        screen.getByRole("button", {
          name: "Execute prediction",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });

  it("executes a suggestion with the combined balance and exposes claim calldata", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("100"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));

    await waitFor(() => {
      expect(createSuggestion).toHaveBeenCalledWith({
        biddingWindowSeconds: 60,
        durationSeconds: 300,
        isUp: true,
        maxAmount: "100000000",
        minAmount: "100000000",
        minOffer: "100000000",
        priceTarget: "65000000000",
      });
    });
    expect(addFunds).toHaveBeenCalledWith("50000000");

    expect(screen.getByText("Prediction #7 is open")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Claim rewards" }));

    expect(
      screen.getByRole("dialog", { name: "Claim rewards" }),
    ).not.toBeNull();
    expect(screen.getByLabelText("Reward to collect")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Request calldata" }));

    await waitFor(() => {
      expect(concludedCalldata).toHaveBeenCalledWith(7, true);
    });
    expect(
      (screen.getByLabelText("Claim calldata") as HTMLTextAreaElement).value,
    ).toBe("0x1234");
  });

  it("onramps only a prediction amount shortfall before sending the request", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    const predictionAmount = await screen.findByLabelText("Prediction amount");
    fireEvent.change(predictionAmount, { target: { value: "75" } });
    expect(screen.getByTestId("prediction-sentence").textContent).toContain(
      ", and I want $150 if I win.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));

    await waitFor(() => expect(createSuggestion).toHaveBeenCalled());
    expect(addFunds).toHaveBeenCalledWith("25000000");
    expect(addFunds.mock.invocationCallOrder[0]).toBeLessThan(
      createSuggestion.mock.invocationCallOrder[0]!,
    );
    expect(createSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({
        minAmount: "75000000",
        maxAmount: "75000000",
        minOffer: "75000000",
      }),
    );
  });

  it("uses an entered amount below the RFQHub balance without onramping", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    const predictionAmount = await screen.findByLabelText("Prediction amount");
    fireEvent.change(predictionAmount, { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));

    await waitFor(() => expect(createSuggestion).toHaveBeenCalled());
    expect(addFunds).not.toHaveBeenCalled();
    expect(createSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({
        minAmount: "25000000",
        maxAmount: "25000000",
        minOffer: "25000000",
      }),
    );
  });

  it("onramps the full prediction amount when the graph balance is zero", async () => {
    requestBalance.mockResolvedValue("0");
    render(<RfqhubPrototype campaignData={campaignData} />);

    const predictionAmount = await screen.findByLabelText("Prediction amount");
    fireEvent.change(predictionAmount, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));

    await waitFor(() => expect(createSuggestion).toHaveBeenCalled());
    expect(addFunds).toHaveBeenCalledWith("10000000");
    expect(createSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({
        minAmount: "10000000",
        maxAmount: "10000000",
      }),
    );
  });

  it("shows advertised websocket takers newest first", async () => {
    const deadline = new Date(Date.now() + 60_000).toISOString();
    const expiry = new Date(Date.now() + 120_000).toISOString();
    mockedUseRfqhubRequests.mockReturnValue({
      connectionStatus: "connected",
      requests: [
        {
          id: "12",
          amount: "25000000",
          minOffer: "5000000",
          isUp: true,
          priceTarget: "65000000000",
          outcome: "BitcoinPrice",
          deadline,
          expiry,
          accountAddress: "0x1234",
          asset: "0xabcd",
          structure: { args: {}, sig: [] },
        },
        {
          id: "11",
          amount: "10000000",
          minOffer: "2000000",
          isUp: false,
          priceTarget: "64000000000",
          outcome: "BitcoinPrice",
          deadline,
          expiry,
          accountAddress: "0x5678",
          asset: "0xef01",
          structure: { args: {}, sig: [] },
        },
      ],
    });

    render(<RfqhubPrototype campaignData={campaignData} />);
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("100"),
    );

    expect(screen.getByRole("heading", { name: "Takers" })).not.toBeNull();
    const requests = screen.getAllByTestId("rfqhub-request");
    expect(requests).toHaveLength(2);
    expect(requests[0]?.textContent).toContain("Taker #12");
    expect(requests[0]?.textContent).toContain("$25");
    expect(requests[0]?.textContent).toContain("Up");
    expect(requests[0]?.textContent).toContain("Minimum offer");
    expect(requests[0]?.textContent).toContain("$5");
    expect(requests[0]?.textContent).toContain("BitcoinPrice");
    expect(requests[1]?.textContent).toContain("$10");
    expect(requests[1]?.textContent).toContain("Down");
  });

  it("renders a red countdown line that drains until the taker deadline", async () => {
    const now = Date.now();
    mockedUseRfqhubRequests.mockReturnValue({
      requests: [
        {
          id: "12",
          accountAddress: "0x1234",
          asset: "BTC",
          isUp: true,
          priceTarget: "65000000000",
          amount: "25000000",
          minOffer: "5000000",
          outcome: "BTC settles above $65,000",
          deadline: new Date(now + 30_000).toISOString(),
          expiry: new Date(now + 60_000).toISOString(),
          structure: { args: {}, sig: [] },
        },
      ],
      connectionStatus: "connected",
    });

    render(<RfqhubPrototype campaignData={campaignData} />);
    await screen.findAllByDisplayValue("100");

    const line = screen.getByTestId("rfqhub-deadline-progress");
    expect(line.className).toContain("bg-red");
    expect(line.style.animationName).toBe("rfqhubDeadlineCountdown");
    expect(line.style.animationDuration).toMatch(/^(29|30)\d{3}ms$/);
  });

  it("flashes a taker card after its minimum offer is matched", async () => {
    const now = Date.now();
    mockedUseRfqhubRequests.mockReturnValue({
      connectionStatus: "connected",
      requests: [
        {
          id: "12",
          accountAddress: "0x1234",
          asset: "BTC",
          isUp: true,
          priceTarget: "65000000000",
          amount: "25000000",
          minOffer: "6000000",
          matchVersion: 1,
          outcome: "BTC settles above $65,000",
          deadline: new Date(now + 30_000).toISOString(),
          expiry: new Date(now + 60_000).toISOString(),
          structure: { args: {}, sig: [] },
        },
      ],
    });

    render(<RfqhubPrototype campaignData={campaignData} />);

    const card = await screen.findByTestId("rfqhub-request");
    expect(card.textContent).toContain("$6");
    expect(card.style.animationName).toBe("rfqhubMakerMatchFlash");
  });

  it("immediately submits the minimum funded maker offer when clicked", async () => {
    mockedUseRfqhubRequests.mockReturnValue({
      connectionStatus: "connected",
      requests: [
        {
          id: "12",
          amount: "250000000",
          minOffer: "60000000",
          isUp: true,
          priceTarget: "65000000000",
          outcome: "BitcoinPrice",
          deadline: new Date(Date.now() + 60_000).toISOString(),
          expiry: new Date(Date.now() + 120_000).toISOString(),
          accountAddress: "0x1234",
          asset: "0xabcd",
          structure: { args: {}, sig: [] },
        },
      ],
    });
    render(<RfqhubPrototype campaignData={campaignData} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Offer minimum for Taker #12" }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(submitBundleMaker).toHaveBeenCalled());
    expect(addFunds).toHaveBeenCalledWith("10000000");
    expect(addFunds.mock.invocationCallOrder[0]).toBeLessThan(
      submitBundleMaker.mock.invocationCallOrder[0]!,
    );
    expect(submitBundleMaker).toHaveBeenCalledWith({
      bundleTakerId: 12,
      minAmount: "60000000",
      maxAmount: "60000000",
    });
    expect(screen.getByText("Offer submitted for Taker #12")).not.toBeNull();
  });

  it("displays an exact doubled total for fractional stakes", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    const stake = await screen.findByLabelText("Prediction amount");
    fireEvent.change(stake, { target: { value: "10.01" } });

    expect(screen.getByTestId("prediction-sentence").textContent).toContain(
      ", and I want $20.02 if I win.",
    );
  });

  it("lets the direction and duration controls update the proposed prediction", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("100"),
    );

    fireEvent.change(screen.getByLabelText("Direction"), {
      target: { value: "down" },
    });
    fireEvent.change(screen.getByLabelText("Duration"), {
      target: { value: "15" },
    });

    expect(
      (screen.getByLabelText("Direction") as HTMLSelectElement).value,
    ).toBe("down");
    expect((screen.getByLabelText("Duration") as HTMLSelectElement).value).toBe(
      "15",
    );
  });
});

describe("Rfqhub navigation feature flag", () => {
  it("hides the Rfqhub link when the flag is disabled", () => {
    mockedUseFeatureFlag.mockReturnValue(false);
    render(<NavigationMenu />);

    expect(screen.queryByRole("link", { name: "Options (BETA!)" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Leaderboard" }).getAttribute("href"),
    ).toBe("/leaderboard");
    expect(
      screen.getByRole("link", { name: "Portfolio" }).getAttribute("href"),
    ).toBe("/portfolio");
  });

  it("shows the RFQHub link when the flag is enabled", () => {
    mockedUseFeatureFlag.mockReturnValue(true);
    render(<NavigationMenu />);

    const link = screen.getByRole("link", { name: "Options (BETA!)" });
    expect(link.getAttribute("href")).toBe("/rfqhub");
  });
});
