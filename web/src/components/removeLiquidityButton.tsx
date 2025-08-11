import { useState } from "react";
import Button from "./themed/button";
import Modal from "./themed/modal";
import RemoveLiquidityDialog from "./removeLiquidityDialog";

export default function RemoveLiquidityButton({
  name,
  campaignId,
  liquidity,
  tradingAddr,
  totalLiquidity,
}: {
  name: string;
  campaignId: `0x${string}`;
  tradingAddr: `0x${string}`;
  liquidity: string;
  totalLiquidity: number;
}) {
  const [isLPModalOpen, setIsLPModalOpen] = useState(false);
  return (
    <>
      <Button
        intent={"no"}
        title={`Remove Liquidity`}
        onClick={() => setIsLPModalOpen(true)}
      />
      <Modal
        isOpen={isLPModalOpen}
        setIsOpen={setIsLPModalOpen}
        title="REMOVE LIQUIDITY"
      >
        <RemoveLiquidityDialog
          liquidity={liquidity}
          close={() => setIsLPModalOpen(false)}
          name={name}
          totalLiquidity={totalLiquidity}
          campaignId={campaignId}
          tradingAddr={tradingAddr}
        />
      </Modal>
    </>
  );
}
