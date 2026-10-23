import { EVENTS, track } from "@/utils/analytics";
import AssetSelector from "./assetSelector";
import Button from "./themed/button";
import Link from "next/link";
import { combineClass } from "@/utils/combineClass";
import USDCImg from "#/images/usdc.svg";
import Image from "next/image";

export default function Funding({
  title,
  fundToBuy,
  closeModal,
  campaignId,
}: {
  title: string;
  fundToBuy: number;
  closeModal: () => void;
  campaignId?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-chicago text-base">
        Supply Liquidity to Your Prediction
      </p>
      <p className="text-center font-chicago text-xl">{title}</p>
      <p className="text-center text-xs">
        {`You need to have at least $0.1 in order to mint a position. You don't have $${fundToBuy}, do you want to supply?`}
      </p>
      <div className="flex gap-4">
        <div
          className={combineClass(
            "relative flex items-center gap-1 rounded-[3px] border border-9black py-2 pr-8 pl-2.5 shadow-9btnSecondaryIdle",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
          )}
        >
          <Image src={USDCImg} alt="usdc" width={20} />
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
                type: "buy",
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
      <Button title="Cancel" intent={"default"} onClick={closeModal} />
    </div>
  );
}
