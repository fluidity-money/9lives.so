import useDppmShareEstimationAll from "./useDppmShareEstimationAll";
import { CampaignDetail, Outcome, Payoff } from "@/types";
import useFinalPrice from "./useFinalPrice";

export default function useDppmRewards({
  tradingAddr,
  address,
  priceMetadata,
  starting,
  ending,
  outcomes,
  singleOutcomeId,
}: {
  tradingAddr: `0x${string}`;
  address?: string;
  priceMetadata: CampaignDetail["priceMetadata"];
  starting: number;
  ending: number;
  outcomes: Outcome[];
  singleOutcomeId?: string;
}) {
  const { data: finalPrice, isLoading } = useFinalPrice({
    symbol: priceMetadata?.baseAsset,
    starting,
    ending,
  });
  const isPriceAbove =
    !!finalPrice &&
    !!priceMetadata &&
    finalPrice > +priceMetadata.priceTargetForUp;
  const {
    data: [{ identifier: downId, ...down }, { identifier: upId, ...up }],
  } = useDppmShareEstimationAll({
    tradingAddr,
    address,
    enabled: !!priceMetadata,
    isPriceAbove,
    outcomes,
  });
  let results: Payoff | null = null;
  if (singleOutcomeId) {
    results = singleOutcomeId === downId ? down : up;
  } else {
    results = {
      dppmFusdc: down.dppmFusdc + up.dppmFusdc,
      ninetailsLoserFusd: down.ninetailsLoserFusd + up.ninetailsLoserFusd,
      ninetailsWinnerFusdc: down.ninetailsWinnerFusdc + up.ninetailsWinnerFusdc,
    };
  }
  const totalRewards = Object.values(results).reduce((acc, v) => acc + v);
  return {
    hasAnyRewards: totalRewards > BigInt(0),
    totalRewards,
    results,
    isLoading,
  };
}
