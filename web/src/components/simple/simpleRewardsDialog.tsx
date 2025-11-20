import useDppmRewards from "@/hooks/useDppmRewards";
import { UnclaimedCampaign } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import { Account } from "thirdweb/wallets";

function SimpleRewardItem({
  data,
  account,
}: {
  data: UnclaimedCampaign;
  account?: Account;
}) {
  const { totalRewards } = useDppmRewards({
    tradingAddr: data.poolAddress,
    priceMetadata: data.priceMetadata,
    starting: data.starting,
    ending: data.ending,
    outcomes: data.outcomes,
    account,
  });

  return (
    <tr>
      <td>{data.name}</td>
      <td>${data.totalSpent}</td>
      <td>${totalRewards}</td>
      <td>${totalRewards - data.totalSpent}</td>
    </tr>
  );
}

export default function SimpleRewardsDialog({
  data,
}: {
  data: UnclaimedCampaign[];
}) {
  const account = useActiveAccount();

  return (
    <table>
      <thead>
        <th>Name</th>
        <th>Spent</th>
        <th>Won</th>
        <th>PnL</th>
      </thead>
      <tbody>
        {data.map((i) => (
          <SimpleRewardItem key={i.identifier} data={i} account={account} />
        ))}
      </tbody>
    </table>
  );
}
