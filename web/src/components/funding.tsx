import AssetSelector from "./assetSelector";
import Button from "./themed/button";
import Link from "next/link";

export default function Funding({
  title,
  outcomes,
  isYesNo,
  fundToBuy,
  closeModal,
}: {
  title: string;
  outcomes: { seed?: number; name: string }[];
  isYesNo: boolean;
  fundToBuy: number;
  closeModal: () => void;
}) {
  const isForBuying = outcomes.length === 1;
  return (
    <div className="flex flex-col gap-4">
      <p className="font-base text-center font-chicago">
        Supply Liquidity to Your {isForBuying ? "Prediction" : "Campaign"}
      </p>
      <p className="font-xl text-center font-chicago">{title}</p>
      <p className="text-center text-xs">
        {isForBuying
          ? `You have to supply $${fundToBuy} in order to mint the position.`
          : `You have to supply total $${fundToBuy}, including $1 to each outcome in your campaign in order to kickstart the liquidity of the campaign.`}
      </p>
      <div className="flex gap-4">
        {outcomes.map((o, idx) => (
          <Button
            key={o.name + o.seed}
            intent={
              isYesNo
                ? outcomes.length === 2 && idx === 0
                  ? "yes"
                  : "no"
                : "default"
            }
            size={"large"}
            title={
              isYesNo
                ? outcomes.length === 2 && idx === 0
                  ? "Yes"
                  : "No"
                : `Predict ${o.name}`
            }
            className={"flex-1"}
          />
        ))}
      </div>
      <div className="flex gap-4">
        <AssetSelector />
        <Link
          href={"https://bridge.superposition.so/"}
          target="_blank"
          className={"flex flex-1"}
        >
          <Button
            title={`BUY $${fundToBuy} TO ${isForBuying ? "MINT POSITION" : "CREATE MARKET"}`}
            intent={"yes"}
            size={"large"}
            className={"flex-1"}
          />
        </Link>
      </div>
      <Button title="Cancel" intent={"default"} onClick={closeModal} />
    </div>
  );
}
