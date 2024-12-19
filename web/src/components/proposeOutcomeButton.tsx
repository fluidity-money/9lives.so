import { useState } from "react";
import Button from "./themed/button";
import Modal from "./themed/modal";
import ProposeOutcome from "./proposeOutcome";
import { Outcome } from "@/types";

export default function ProposeOutcomeButton({
  title,
  ending,
  outcomes,
}: {
  title: string;
  ending: number;
  outcomes: Outcome[];
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
        title="Choose a Proposed Outcome"
      >
        <ProposeOutcome title={title} ending={ending} outcomes={outcomes} />
      </Modal>
    </>
  );
}
