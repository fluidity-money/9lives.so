import { useState } from "react";
import Button from "./themed/button";
import Modal from "./themed/modal";
import ProposeOutcome from "./proposeOutcome";
import { Outcome } from "@/types";

export default function ProposeOutcomeButton({
  title,
  ending,
  outcomes,
  tradingAddr,
}: {
  title: string;
  ending: number;
  outcomes: Outcome[];
  tradingAddr: `0x${string}`;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button
        title="Propose Outcome"
        intent={"yes"}
        size={"medium"}
        onClick={() => setIsModalOpen(true)}
      />
      <Modal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title="Propose A Winner"
      >
        <ProposeOutcome
          title={title}
          ending={ending}
          outcomes={outcomes}
          tradingAddr={tradingAddr}
          closeModal={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
