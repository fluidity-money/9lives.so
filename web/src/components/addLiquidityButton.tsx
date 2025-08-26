import { useState } from "react";
import Button from "./themed/button";
import Modal from "./themed/modal";
import AddLiquidityDialog from "./addLiquidityDialog";
import { CampaignDetail } from "@/types";

export default function AddLiquidityButton({
  name,
  campaignId,
  tradingAddr,
  data,
}: {
  name: string;
  campaignId: `0x${string}`;
  tradingAddr: `0x${string}`;
  data: CampaignDetail;
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
          data={data}
          close={() => setIsLPModalOpen(false)}
          name={name}
          campaignId={campaignId}
          tradingAddr={tradingAddr}
        />
      </Modal>
    </>
  );
}
