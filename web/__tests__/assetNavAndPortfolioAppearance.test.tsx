import { render, screen } from "@testing-library/react";
import React from "react";
import AssetNav from "../src/components/v2/assetNav";
import NavContextProvider from "../src/providers/navContext";
import PositionRow from "../src/components/position/positionRow";
import PositionTable from "../src/components/position/positionTable";

jest.mock("../src/config", () => ({
  __esModule: true,
  default: {
    simpleMarkets: {
      btc: {
        slug: "btc",
        tabTitle: "Bitcoin",
        periods: ["15mins"],
        listed: true,
      },
      eth: {
        slug: "eth",
        tabTitle: "Ethereum",
        periods: ["15mins"],
        listed: true,
      },
    },
    destinationChain: {
      blockExplorers: { default: { url: "https://explorer.test" } },
    },
    contracts: { decimals: { fusdc: 6 } },
  },
}));

jest.mock("../src/hooks/useAssets", () => ({
  __esModule: true,
  default: () => ({ data: [] }),
}));

jest.mock("../src/hooks/useAssetsHourlyDelta", () => ({
  __esModule: true,
  default: () => ({
    data: [
      { name: "btc", price: "110", hourAgoPrice: "100" },
      { name: "eth", price: "90", hourAgoPrice: "100" },
    ],
  }),
}));

jest.mock("../src/utils/isMarketOpen", () => ({
  __esModule: true,
  default: () => true,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("../src/components/v2/groupButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../src/components/v2/groupButtonMobile", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../src/components/v2/assetButton", () => ({
  __esModule: true,
  default: ({ title, isPriceUp }: { title: string; isPriceUp?: boolean }) => (
    <span
      data-testid={`asset-${title}`}
      data-direction={isPriceUp ? "up" : "down"}
    />
  ),
}));

jest.mock("../src/components/position/positionBody", () => ({
  __esModule: true,
  default: ({ modern }: { modern?: boolean }) => (
    <tbody data-testid="position-body" data-modern={String(modern)} />
  ),
}));

jest.mock("../src/hooks/useClaim", () => ({
  __esModule: true,
  default: () => ({ claim: jest.fn() }),
}));

jest.mock("../src/hooks/useConnectWallet", () => ({
  __esModule: true,
  default: () => ({ connect: jest.fn() }),
}));

jest.mock("../src/hooks/useFeatureFlag", () => ({
  __esModule: true,
  default: () => false,
}));

jest.mock("../src/hooks/useClaimAllPools", () => ({
  __esModule: true,
  default: () => ({ mutate: jest.fn() }),
}));

jest.mock("../src/hooks/useClaimAllPoolsAS", () => ({
  __esModule: true,
  default: () => ({ mutate: jest.fn() }),
}));

jest.mock("../src/hooks/useEstimateBurn", () => ({
  __esModule: true,
  default: () => ({ data: BigInt(0) }),
}));

jest.mock("../src/hooks/useDppmRewards", () => ({
  __esModule: true,
  default: () => ({
    totalRewards: 0,
    results: {
      dppmFusdc: 0,
      ninetailsWinnerFusdc: 0,
      ninetailsLoserFusd: 0,
    },
    isLoading: false,
  }),
}));

jest.mock("../src/stores/portfolioStore", () => ({
  usePortfolioStore: (
    selector: (state: { addPositionValue: jest.Mock }) => unknown,
  ) => selector({ addPositionValue: jest.fn() }),
}));

jest.mock("@reown/appkit/react", () => ({
  useAppKitAccount: () => ({ address: undefined }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe("asset navigation price direction", () => {
  it("shows each asset's own direction instead of the current screen's direction", () => {
    render(
      <NavContextProvider initialSymbol="btc" initialPeriod="15mins">
        <AssetNav assets={[]} />
      </NavContextProvider>,
    );

    expect(
      screen.getByTestId("asset-Bitcoin").getAttribute("data-direction"),
    ).toBe("up");
    expect(
      screen.getByTestId("asset-Ethereum").getAttribute("data-direction"),
    ).toBe("down");
  });
});

describe("portfolio position appearance", () => {
  it("passes the modern appearance through the portfolio position table", () => {
    render(<PositionTable modern />);

    expect(
      screen.getByTestId("position-body").getAttribute("data-modern"),
    ).toBe("true");
  });

  it("uses theme-aware v2 row surfaces in modern mode", () => {
    const { container } = render(
      <table>
        <tbody>
          <PositionRow
            modern
            data={{
              id: `0x${"1".repeat(64)}`,
              shareAddress: `0x${"2".repeat(40)}`,
              name: "Up",
              balance: "1",
              balanceRaw: BigInt(1_000_000),
            }}
            price="0.5"
            history={[]}
            campaignContent={
              {
                identifier: `0x${"3".repeat(64)}`,
                name: "Test market",
                poolAddress: `0x${"4".repeat(40)}`,
                outcomes: [],
                shares: [],
                odds: [],
                isDpm: false,
                isDppm: false,
                starting: 0,
                ending: 0,
              } as never
            }
          />
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr");
    const firstCell = container.querySelector("td");

    expect(row?.className).toContain("text-2black");
    expect(row?.className).toContain("[&>td]:bg-neutral-100");
    expect(firstCell?.className).not.toContain("bg-[#DDDDDD]");
  });
});
