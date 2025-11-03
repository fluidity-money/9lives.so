import { Account } from "thirdweb/wallets";
import useDppmShareEstimationAll from "./useDppmShareEstimationAll";

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
  const result = [
    outcome0[0] + outcome1[0],
    outcome0[1] + outcome1[1],
    outcome0[2] + outcome1[2],
  ];
  const totalRewards = result.reduce((acc, v) => acc + v);
  return { hasAnyRewards: totalRewards > BigInt(0), totalRewards, result };
}
