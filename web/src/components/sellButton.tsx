import Button from "./themed/button";
import { Outcome } from "@/types";
import { useState } from "react";
import Modal from "./themed/modal";
import SellDialog from "./sellDialog";
export default function SellButton({
  campaignId,
  outcomeId,
  shareAddr,
  tradingAddr,
  outcomeName,
  outcomes,
  maxShareAmount,
  maxUsdcValue,
}: {
  campaignId: `0x${string}`;
  outcomeId: `0x${string}`;
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  outcomeName: string;
  maxShareAmount: string;
  maxUsdcValue: number;
}) {
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  return (
    <>
      <Button
        title={"Sell"}
        intent={"no"}
        onClick={() => setIsSellDialogOpen(true)}
      />
      <Modal
        title="Sell Shares"
        isOpen={isSellDialogOpen}
        setIsOpen={() => setIsSellDialogOpen(false)}
      >
        <SellDialog
          close={() => setIsSellDialogOpen(false)}
          name={outcomeName}
          campaignId={campaignId}
          outcomeId={outcomeId}
          shareAddr={shareAddr}
          tradingAddr={tradingAddr}
          outcomes={outcomes}
          maxShareAmount={maxShareAmount}
          maxUsdcValue={maxUsdcValue}
        />
      </Modal>
    </>
  );
}
