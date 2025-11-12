import { Account } from "thirdweb/wallets";
import useDppmShareEstimationAll from "./useDppmShareEstimationAll";
import { CampaignDetail, Outcome, Payoff } from "@/types";
import useFinalPrice from "./useFinalPrice";

export default function useDppmRewards({
  tradingAddr,
  account,
  priceMetadata,
  starting,
  ending,
  outcomes,
  singleOutcomeId,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  priceMetadata: CampaignDetail["priceMetadata"];
  starting: number;
  ending: number;
  outcomes: Outcome[];
  singleOutcomeId?: string;
}) {
  const { data: finalPricePoint } = useFinalPrice({
    symbol: priceMetadata?.baseAsset,
    starting,
    ending,
  });
  const isPriceAbove =
    !!finalPricePoint &&
    !!priceMetadata &&
    finalPricePoint.price > +priceMetadata.priceTargetForUp;
  const {
    data: [{ identifier: id0, ...outcome0 }, { identifier: id1, ...outcome1 }],
  } = useDppmShareEstimationAll({
    tradingAddr,
    account,
    enabled: !!priceMetadata,
    isPriceAbove,
    outcomes,
  });
  let results: Payoff | null = null;
  if (singleOutcomeId) {
    results = singleOutcomeId === id0 ? outcome0 : outcome1;
  } else {
    results = {
      dppmFusdc: outcome0.dppmFusdc + outcome1.dppmFusdc,
      ninetailsLoserFusd:
        outcome0.ninetailsLoserFusd + outcome1.ninetailsLoserFusd,
      ninetailsWinnerFusdc:
        outcome0.ninetailsWinnerFusdc + outcome1.ninetailsWinnerFusdc,
    };
  }
  const totalRewards = Object.values(results).reduce((acc, v) => acc + v);
  return { hasAnyRewards: totalRewards > BigInt(0), totalRewards, results };
}
