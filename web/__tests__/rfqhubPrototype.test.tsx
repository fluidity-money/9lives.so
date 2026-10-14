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
const createSuggestion = jest.fn();
const concludedCalldata = jest.fn();
const addFunds = jest.fn();

beforeEach(() => {
  window.localStorage.clear();
  requestBalance.mockReset().mockResolvedValue("50000000");
  createSuggestion.mockReset().mockResolvedValue({
    amountSpent: "50000000",
    bundleId: 7,
    leftoverBal: "0",
  });
  concludedCalldata.mockReset().mockResolvedValue("0x1234");
  addFunds.mockReset().mockResolvedValue("0xfunding");
  mockedUseRfqhub.mockReturnValue({
    accountAddress: "0x1234",
    requestBalance,
    createSuggestion,
    concludedCalldata,
    addFunds,
  } as unknown as ReturnType<typeof useRfqhub>);
  mockedUseRfqhubRequests.mockReturnValue({
    requests: [],
    connectionStatus: "connected",
  });
});

describe("RfqhubPrototype", () => {
  it("renders the live BTC graph and prefills the prediction amount from the graph balance", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    expect(mockedUseRfqhub.mock.calls.length).toBeGreaterThan(0);
    expect(screen.getByTestId("live-btc-chart")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Make a prediction" }),
    ).not.toBeNull();
    expect(screen.getByText("With")).not.toBeNull();
    expect(screen.getByText(", I predict that")).not.toBeNull();
    expect(
      ((await screen.findByLabelText("Prediction amount")) as HTMLInputElement)
        .value,
    ).toBe("50");
    expect((screen.getByLabelText("Asset") as HTMLSelectElement).value).toBe(
      "BTC",
    );
    expect(
      (screen.getByLabelText("Direction") as HTMLSelectElement).value,
    ).toBe("up");
    expect((screen.getByLabelText("Duration") as HTMLSelectElement).value).toBe(
      "5",
    );
    expect(
      (screen.getByLabelText("Winnings amount") as HTMLInputElement)
        .valueAsNumber,
    ).toBe(100);
    expect(
      (
        screen.getByRole("button", {
          name: "Execute prediction",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });

  it("executes a suggestion with the rolled-up balance and exposes claim calldata", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("50"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));

    await waitFor(() => {
      expect(createSuggestion).toHaveBeenCalledWith({
        biddingWindowSeconds: 60,
        durationSeconds: 300,
        isUp: true,
        maxAmount: "50000000",
        minAmount: "50000000",
        minOffer: "100000000",
        priceTarget: "65000000000",
      });
    });
    expect(addFunds).not.toHaveBeenCalled();

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

  it("shows incoming websocket requests newest first", async () => {
    mockedUseRfqhubRequests.mockReturnValue({
      connectionStatus: "connected",
      requests: [
        {
          id: "12",
          bundleTakerId: 8,
          amount: "25000000",
          createdAt: "2026-10-13T12:01:00Z",
        },
        {
          id: "11",
          bundleTakerId: 7,
          amount: "10000000",
          createdAt: "2026-10-13T12:00:00Z",
        },
      ],
    });

    render(<RfqhubPrototype campaignData={campaignData} />);
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("50"),
    );

    const requests = screen.getAllByTestId("rfqhub-request");
    expect(requests).toHaveLength(2);
    expect(requests[0]?.textContent).toContain("$25");
    expect(requests[0]?.textContent).toContain("#8");
    expect(requests[1]?.textContent).toContain("$10");
  });

  it("opens Add funds and onramps the entered amount", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    fireEvent.click(screen.getByRole("button", { name: "Add funds" }));
    expect(screen.getByRole("dialog", { name: "Add funds" })).not.toBeNull();

    fireEvent.change(screen.getByLabelText("Amount to add"), {
      target: { value: "25" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm add funds" }));

    await waitFor(() => expect(addFunds).toHaveBeenCalledWith("25000000"));
    expect(screen.getByText("$25 added to RFQHub")).not.toBeNull();
  });

  it("lets the sentence controls update the proposed prediction", async () => {
    render(<RfqhubPrototype campaignData={campaignData} />);
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Prediction amount") as HTMLInputElement).value,
      ).toBe("50"),
    );

    fireEvent.change(screen.getByLabelText("Direction"), {
      target: { value: "down" },
    });
    fireEvent.change(screen.getByLabelText("Duration"), {
      target: { value: "15" },
    });
    fireEvent.change(screen.getByLabelText("Winnings amount"), {
      target: { value: "250" },
    });

    expect(
      (screen.getByLabelText("Direction") as HTMLSelectElement).value,
    ).toBe("down");
    expect((screen.getByLabelText("Duration") as HTMLSelectElement).value).toBe(
      "15",
    );
    expect(
      (screen.getByLabelText("Winnings amount") as HTMLInputElement)
        .valueAsNumber,
    ).toBe(250);
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
