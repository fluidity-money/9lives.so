import { fireEvent, render, screen } from "@testing-library/react";
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

describe("RfqhubPrototype", () => {
  it("renders the live BTC graph and editable prediction sentence", () => {
    render(<RfqhubPrototype campaignData={campaignData} />);

    expect(mockedUseRfqhub).toHaveBeenCalledTimes(1);
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
    ).toBe(true);
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

describe("RFQHub navigation feature flag", () => {
  it("hides the RFQHub link when the flag is disabled", () => {
    mockedUseFeatureFlag.mockReturnValue(false);
    render(<NavigationMenu />);

    expect(screen.queryByRole("link", { name: "RFQ" })).toBeNull();
  });

  it("shows the RFQHub link when the flag is enabled", () => {
    mockedUseFeatureFlag.mockReturnValue(true);
    render(<NavigationMenu />);

    const link = screen.getByRole("link", { name: "RFQ" });
    expect(link.getAttribute("href")).toBe("/rfqhub");
  });
});
