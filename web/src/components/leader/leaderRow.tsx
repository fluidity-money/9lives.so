import useConnectWallet from "@/hooks/useConnectWallet";
import { Leader } from "@/types";
import { combineClass } from "@/utils/combineClass";
import Button from "../themed/button";

export default function LeaderRow({ data }: { data?: Leader }) {
  const cellStyle =
    "border-b border-b-gray-200 font-chicago text-xs text-9black h-16";
  const { connect } = useConnectWallet();

  if (!data)
    return (
      <tr className="cursor-pointer bg-9blueLight/50" onClick={() => connect()}>
        <td className={combineClass(cellStyle)}>???</td>
        <td className={combineClass(cellStyle)}>
          <Button
            intent={"default"}
            title="Connect your wallet to see your rank"
          />
        </td>
        <td className={combineClass(cellStyle)}>???</td>
        <td className={combineClass(cellStyle)}></td>
      </tr>
    );

  return (
    <tr className="hover:bg-9blueLight/50">
      <td className={combineClass(cellStyle)}>{data.ranking}</td>
      <td className={combineClass(cellStyle)}>
        <span className="block w-[100px] truncate sm:w-[160px] lg:w-full">
          {data.wallet}
        </span>
      </td>
      <td className={combineClass(cellStyle)}>{data.scoring}</td>
      {/* <td className={combineClass(cellStyle)}></td> */}
    </tr>
  );
}
