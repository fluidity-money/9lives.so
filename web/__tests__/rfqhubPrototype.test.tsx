import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import RfqhubPrototype from "@/components/rfqhub/rfqhubPrototype";
import NavigationMenu from "@/components/v2/navigationMenu";
import useFeatureFlag from "../src/hooks/useFeatureFlag";
import useRfqhub from "../src/hooks/useRfqhub";
import useRfqhubRequests from "../src/hooks/useRfqhubRequests";
import useAssetPrices from "../src/hooks/useAssetPrices";

jest.mock("../src/hooks/useAssetPrices", () => ({
  __esModule: true,
  default: jest.fn(),
}));

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

jest.mock("../src/components/rfqhub/rfqhubPriceChart", () => ({
  __esModule: true,
  default: () => <div data-testid="live-btc-chart" />,
}));

jest.mock("../src/components/pointsMenuButton", () => ({
  __esModule: true,
  default: () => null,
}));

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
  jest.mocked(useAssetPrices).mockReturnValue({
    prices: [{ id: 1, timestamp: Date.now(), price: 65000 }],
    connected: true,
  });
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
  it("waits for an oracle quote and disables predictions while disconnected", async () => {
    jest
      .mocked(useAssetPrices)
      .mockReturnValue({ prices: [], connected: true });
    const { rerender } = render(<RfqhubPrototype />);
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("100"),
    );
    const execute = () =>
      screen.getByRole("button", {
        name: "Execute prediction",
      }) as HTMLButtonElement;
    expect(execute().disabled).toBe(true);
    jest.mocked(useAssetPrices).mockReturnValue({
      prices: [{ id: 1, timestamp: Date.now(), price: 65123.123456 }],
      connected: false,
    });
    rerender(<RfqhubPrototype />);
    expect(execute().disabled).toBe(true);
    fireEvent.click(execute());
    expect(createSuggestion).not.toHaveBeenCalled();
  });

  it("submits the latest full-precision oracle price after funding, in six-decimal backend units", async () => {
    let finishFunding!: () => void;
    addFunds.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishFunding = resolve;
        }),
    );
    const { rerender } = render(<RfqhubPrototype />);
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("100"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));
    await waitFor(() => expect(addFunds).toHaveBeenCalled());
    jest.mocked(useAssetPrices).mockReturnValue({
      prices: [{ id: 2, timestamp: Date.now(), price: 65123.123456 }],
      connected: true,
    });
    rerender(<RfqhubPrototype />);
    await act(async () => finishFunding());
    expect(createSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({ priceTarget: "65123123456" }),
    );
  });

  it("does not submit if the price feed disconnects during funding", async () => {
    let finishFunding!: () => void;
    addFunds.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishFunding = resolve;
        }),
    );
    const { rerender } = render(<RfqhubPrototype />);
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("100"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));
    await waitFor(() => expect(addFunds).toHaveBeenCalled());
    jest
      .mocked(useAssetPrices)
      .mockReturnValue({ prices: [], connected: false });
    rerender(<RfqhubPrototype />);
    await act(async () => finishFunding());
    expect(createSuggestion).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(
      "Waiting for a live BTC price",
    );
  });

  it("refreshes the estimated offer every second and submits the current floor plus one unit", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-14T12:00:00Z"));
    try {
      mockedUseRfqhubRequests.mockReturnValue({
        connectionStatus: "connected",
        requests: [
          {
            id: "7",
            accountAddress: "0x1234",
            asset: "BTC",
            amount: "10000000",
            minOffer: "8000000",
            createdBy: "2026-10-14T12:00:00Z",
            decayRate: 0.5,
            isUp: true,
            priceTarget: "65000000000",
            outcome: "BitcoinPrice",
            deadline: "2026-10-14T12:05:00Z",
            expiry: "2026-10-14T12:05:00Z",
            structure: { args: {}, sig: [] },
          },
        ],
      });
      const { unmount } = render(<RfqhubPrototype />);
      await act(async () => {});
      expect(screen.getByTestId("rfqhub-request").textContent).toContain(
        "$8.000001",
      );
      act(() => jest.advanceTimersByTime(1000));
      expect(screen.getByTestId("rfqhub-request").textContent).toContain(
        "$4.000001",
      );
      await act(async () =>
        fireEvent.click(
          screen.getByRole("button", { name: "Offer minimum for Taker #7" }),
        ),
      );
      expect(submitBundleMaker).toHaveBeenCalledWith({
        bundleTakerId: 7,
        minAmount: "4000001",
        maxAmount: "4000001",
      });
      unmount();
    } finally {
      jest.useRealTimers();
    }
  });
  it("prefills the stake from the combined RFQHub and wallet balances", async () => {
    requestBalance.mockResolvedValue("10000000");
    render(<RfqhubPrototype />);

    expect(mockedUseRfqhub.mock.calls.length).toBeGreaterThan(0);
    expect(screen.getByTestId("live-btc-chart")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Make a prediction" }),
    ).not.toBeNull();
    expect(screen.getByText("I predict with $")).not.toBeNull();
    expect(screen.getByText("that")).not.toBeNull();
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
      "the $65,000.00 in",
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
    render(<RfqhubPrototype />);

    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("100"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));

    await waitFor(() => {
      expect(createSuggestion).toHaveBeenCalledWith({
        biddingWindowSeconds: 300,
        durationSeconds: 300,
        isUp: true,
        maxAmount: "100000000",
        minAmount: "100000000",
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
    render(<RfqhubPrototype />);

    const predictionAmount = await screen.findByLabelText("Prediction amount");
    fireEvent.change(predictionAmount, { target: { value: "75" } });
    expect(screen.getByTestId("prediction-sentence").textContent).toContain(
      "the $65,000.00 in",
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
      }),
    );
  });

  it("uses an entered amount below the RFQHub balance without onramping", async () => {
    render(<RfqhubPrototype />);

    const predictionAmount = await screen.findByLabelText("Prediction amount");
    fireEvent.change(predictionAmount, { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));

    await waitFor(() => expect(createSuggestion).toHaveBeenCalled());
    expect(addFunds).not.toHaveBeenCalled();
    expect(createSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({
        minAmount: "25000000",
        maxAmount: "25000000",
      }),
    );
  });

  it("onramps the full prediction amount when the graph balance is zero", async () => {
    requestBalance.mockResolvedValue("0");
    render(<RfqhubPrototype />);

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
          createdBy: "2026-10-14T11:00:00Z",
          decayRate: 0,
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
          createdBy: "2026-10-14T11:00:00Z",
          decayRate: 0,
        },
      ],
    });

    render(<RfqhubPrototype />);
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
          createdBy: "2026-10-14T11:00:00Z",
          decayRate: 0,
        },
      ],
      connectionStatus: "connected",
    });

    render(<RfqhubPrototype />);
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
          createdBy: "2026-10-14T11:00:00Z",
          decayRate: 0,
        },
      ],
    });

    render(<RfqhubPrototype />);

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
          createdBy: "2026-10-14T11:00:00Z",
          decayRate: 0,
        },
      ],
    });
    render(<RfqhubPrototype />);

    fireEvent.click(
      screen.getByRole("button", { name: "Offer minimum for Taker #12" }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(submitBundleMaker).toHaveBeenCalled());
    expect(addFunds).toHaveBeenCalledWith("10000001");
    expect(addFunds.mock.invocationCallOrder[0]).toBeLessThan(
      submitBundleMaker.mock.invocationCallOrder[0]!,
    );
    expect(submitBundleMaker).toHaveBeenCalledWith({
      bundleTakerId: 12,
      minAmount: "60000001",
      maxAmount: "60000001",
    });
    expect(screen.getByText("Offer submitted for Taker #12")).not.toBeNull();
  });

  it("keeps fractional stakes editable with ten-cent increments", async () => {
    render(<RfqhubPrototype />);

    const stake = await screen.findByLabelText("Prediction amount");
    fireEvent.change(stake, { target: { value: "10.01" } });

    const amount = screen.getByLabelText(
      "Prediction amount",
    ) as HTMLInputElement;
    expect(amount.value).toBe("10.01");
    expect(amount.step).toBe("0.10");
    amount.value = "10";
    amount.stepUp();
    expect(amount.value).toBe("10.1");
    amount.stepDown();
    expect(amount.value).toBe("10");
  });

  it("lets the direction and duration controls update the proposed prediction", async () => {
    render(<RfqhubPrototype />);
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
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));
    await waitFor(() =>
      expect(createSuggestion).toHaveBeenCalledWith(
        expect.objectContaining({
          durationSeconds: 900,
          biddingWindowSeconds: 900,
        }),
      ),
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
