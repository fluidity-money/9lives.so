import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RfqhubPrototype from "@/components/rfqhub/rfqhubPrototype";
import NavigationMenu from "@/components/v2/navigationMenu";
import useFeatureFlag from "../src/hooks/useFeatureFlag";
import useRfqhub from "../src/hooks/useRfqhub";
import type { SimpleCampaignDetail } from "@/types";

jest.mock("../src/hooks/useFeatureFlag", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../src/hooks/useRfqhub", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
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
const requestBalance = jest.fn();
const createSuggestion = jest.fn();
const concludedCalldata = jest.fn();

beforeEach(() => {
  window.localStorage.clear();
  requestBalance.mockReset().mockResolvedValue("50000000");
  createSuggestion.mockReset().mockResolvedValue({
    amountSpent: "50000000",
    bundleId: 7,
    leftoverBal: "0",
  });
  concludedCalldata.mockReset().mockResolvedValue("0x1234");
  mockedUseRfqhub.mockReturnValue({
    accountAddress: "0x1234",
    requestBalance,
    createSuggestion,
    concludedCalldata,
  } as unknown as ReturnType<typeof useRfqhub>);
});

describe("RfqhubPrototype", () => {
  it("renders the live BTC graph and editable prediction sentence", () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    expect(mockedUseRfqhub.mock.calls.length).toBeGreaterThan(0);
    expect(screen.getByTestId("live-btc-chart")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Make a prediction" }),
    ).not.toBeNull();
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

  it("shows an actionable error when no rolled-up balance is available", async () => {
    requestBalance.mockResolvedValue("0");
    render(<RfqhubPrototype campaignData={campaignData} />);

    fireEvent.click(screen.getByRole("button", { name: "Execute prediction" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "No RFQHub balance is available",
    );
    expect(createSuggestion).not.toHaveBeenCalled();
  });

  it("lets the sentence controls update the proposed prediction", () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

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
