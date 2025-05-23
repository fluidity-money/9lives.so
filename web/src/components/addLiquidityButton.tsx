import { useState } from "react";
import Button from "./themed/button";
import Modal from "./themed/modal";
import AddLiquidityDialog from "./addLiquidityDialog";

export default function AddLiquidityButton({
  name,
  campaignId,
  tradingAddr,
}: {
  name: string;
  campaignId: `0x${string}`;
  tradingAddr: `0x${string}`;
}) {
  const [isLPModalOpen, setIsLPModalOpen] = useState(false);
  return (
    <>
      <Button
        intent={"yes"}
        title="Add Liquidity"
        onClick={() => setIsLPModalOpen(true)}
      />
      <Modal
        isOpen={isLPModalOpen}
        setIsOpen={setIsLPModalOpen}
        title="ADD LIQUIDITY"
      >
        <AddLiquidityDialog
          close={() => setIsLPModalOpen(false)}
          name={name}
          campaignId={campaignId}
          tradingAddr={tradingAddr}
        />
      </Modal>
    </>
  );
}
