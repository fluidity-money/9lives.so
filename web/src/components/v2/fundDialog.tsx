import { EVENTS, track } from "@/utils/analytics";
import Button from "./button";
import Link from "next/link";
import USDCImg from "#/images/usdc.svg";
import Image from "next/image";

export default function Funding({
  title,
  fundToBuy,
  closeModal,
  campaignId,
  type,
}: {
  title: string;
  fundToBuy: number;
  closeModal: () => void;
  campaignId?: string;
  type: "buy" | "create";
}) {
  const isForBuying = type === "buy";
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-chicago text-base">
        Supply Liquidity to Your {isForBuying ? "Prediction" : "Campaign"}
      </p>
      <p className="text-center font-chicago text-xl">{title}</p>
      <p className="text-center text-xs">
        {isForBuying
          ? `You need to have at least $0.1 in order to mint a position. You don't have $${fundToBuy}, do you want to supply?`
          : `You have to supply total $${fundToBuy}, including $1 to each outcome in your campaign in order to kickstart the liquidity of the campaign.`}
      </p>
      <div className="flex gap-4">
        <div className="relative flex items-center gap-1 py-2 pl-2.5 pr-8">
          <Image src={USDCImg} alt="fusdc" width={20} />
          <span className="font-chicago">{"USDC"}</span>
        </div>
        <Link
          href={"https://bridge.superposition.so/"}
          target="_blank"
          className={"flex flex-1"}
        >
          <Button
            onClick={() => {
              track(EVENTS.FUNDING_CLICKED, {
                type,
                campaignTitle: title,
                campaignId,
              });
            }}
            title={`GO TO THE BRIDGE FOR FUNDING`}
            intent={"yes"}
            size={"large"}
            className={"flex-1"}
          />
        </Link>
      </div>
      <Button title="Cancel" onClick={closeModal} />
    </div>
  );
}
