import { useState } from "react";
import Button from "./themed/button";
import Modal from "./themed/modal";
import FundingLP from "./fundingLP";

export default function FundingLPButton({ name }: { name: string }) {
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
        <FundingLP close={() => setIsLPModalOpen(false)} name={name} />
      </Modal>
    </>
  );
}
