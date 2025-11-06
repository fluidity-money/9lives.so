import { Account } from "thirdweb/wallets";
import useDppmShareEstimationAll from "./useDppmShareEstimationAll";
import { CampaignDetail, Payoff } from "@/types";
import useFinalPrice from "./useFinalPrice";

export default function useDppmRewards({
  tradingAddr,
  account,
  priceMetadata,
  starting,
  ending,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  priceMetadata: CampaignDetail["priceMetadata"];
  starting: number;
  ending: number;
}) {
  const { data: finalPricePoint } = useFinalPrice({
    symbol: priceMetadata?.baseAsset,
    starting,
    ending,
  });
  const isPriceAbove =
    !!finalPricePoint &&
    !!priceMetadata &&
    +priceMetadata.priceTargetForUp > finalPricePoint.price;
  const {
    data: [outcome0, outcome1],
  } = useDppmShareEstimationAll({
    tradingAddr,
    account,
    enabled: !!priceMetadata,
    isPriceAbove,
  });
  const result: Payoff = {
    dppmFusdc: outcome0.dppmFusdc + outcome1.dppmFusdc,
    ninetailsLoserFusd:
      outcome0.ninetailsLoserFusd + outcome1.ninetailsLoserFusd,
    ninetailsWinnerFusdc:
      outcome0.ninetailsWinnerFusdc + outcome1.ninetailsWinnerFusdc,
  };
  const totalRewards = Object.values(result).reduce((acc, v) => acc + v);
  return { hasAnyRewards: totalRewards > BigInt(0), totalRewards, result };
}
