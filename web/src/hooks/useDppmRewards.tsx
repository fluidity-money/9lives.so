import { Account } from "thirdweb/wallets";
import useDppmShareEstimationAll from "./useDppmShareEstimationAll";
import { PayoffResponse } from "@/types";

export default function useDppmRewards({
  tradingAddr,
  account,
  enabled = true,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  enabled?: boolean;
}) {
  const [outcome0, outcome1] = useDppmShareEstimationAll({
    tradingAddr,
    account,
    enabled,
  });
  const result: PayoffResponse = {
    dppmFusdc: outcome0.dppmFusdc + outcome1.dppmFusdc,
    ninetailsLoserFusd:
      outcome0.ninetailsLoserFusd + outcome1.ninetailsLoserFusd,
    ninetailsWinnerFusdc:
      outcome0.ninetailsWinnerFusdc + outcome1.ninetailsWinnerFusdc,
  };
  const totalRewards = Object.values(result).reduce((acc, v) => acc + v);
  return { hasAnyRewards: totalRewards > BigInt(0), totalRewards, result };
}
