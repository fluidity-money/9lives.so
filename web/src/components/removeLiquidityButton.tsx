import { useState } from "react";
import Button from "./themed/button";
import Modal from "./themed/modal";
import RemoveLiquidityDialog from "./removeLiquidityDialog";
import { CampaignDetail } from "@/types";

export default function RemoveLiquidityButton({
  data,
  userLiquidity,
}: {
  userLiquidity: string;
  data: CampaignDetail;
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
          userLiquidity={userLiquidity}
          data={data}
          close={() => setIsLPModalOpen(false)}
        />
      </Modal>
    </>
  );
}
