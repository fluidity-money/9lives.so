import { combineClass } from "@/utils/combineClass";
import LeaderRow from "./leaderRow";
import { useAppKitAccount } from "@reown/appkit/react";
import use9LivesPoints from "@/hooks/use9LivesPoints";

export default function LeaderTable() {
  const { data, isLoading } = use9LivesPoints({});

  const titles = ["Rank", "User", "Points", "PnL", "Volume"];
  const account = useAppKitAccount();
  const accountInTheList = data?.find(
    (i) => i.wallet.toLowerCase() === account?.address?.toLowerCase(),
  );
  return (
    <table className="w-full border-separate border-spacing-0 overflow-auto">
      <thead className="sticky top-0 bg-9layer">
        <tr>
          {titles.map((title, index) => (
            <th
              key={index}
              className={combineClass(
                index === 0 && "py-3",
                "border-y border-y-gray-200 text-left font-chicago text-xs font-normal uppercase text-gray-400",
              )}
            >
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="w-full">
        {account?.address ? (
          accountInTheList ? (
            <LeaderRow
              data={{
                wallet: accountInTheList.wallet,
                amount: accountInTheList.amount,
                rank: accountInTheList.rank,
              }}
              highlightUser
            />
          ) : null
        ) : (
          <LeaderRow />
        )}
        {isLoading ? (
          <tr>
            <th colSpan={titles.length}>
              <div className="skeleton h-[400px]" />
            </th>
          </tr>
        ) : (
          data?.map((item, idx) => <LeaderRow key={item.wallet} data={item} />)
        )}
      </tbody>
    </table>
  );
}
