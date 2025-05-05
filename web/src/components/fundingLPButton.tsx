import { useState } from "react";
import Button from "./themed/button";
import Modal from "./themed/modal";
import FundingLP from "./fundingLP";

export default function FundingLPButton({
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
        <FundingLP
          close={() => setIsLPModalOpen(false)}
          name={name}
          campaignId={campaignId}
          tradingAddr={tradingAddr}
        />
      </Modal>
    </>
  );
}
