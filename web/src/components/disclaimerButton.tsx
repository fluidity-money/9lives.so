"use client";

import { useEffect, useState } from "react";
import Modal from "./modal";
import Image from "next/image";
import InfoIcon from "#/icons/info.svg";
import Disclaimer from "./disclaimer";
export default function DisclaimerButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const visitedBefore = window.localStorage.getItem("visitedBefore");
    if (!visitedBefore) {
      setIsModalOpen(true);
      window.localStorage.setItem("visitedBefore", "true");
    }
  }, []);
  return (
    <>
      <button
        className="flex h-10 items-center justify-center gap-1 border-l-2 border-l-9black px-4 font-chicago text-xs underline"
        onClick={() => setIsModalOpen(true)}
      >
        How It Works <Image src={InfoIcon} width={15} alt="How it works?" />
      </button>
      <Modal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title="How it works"
      >
        <Disclaimer />
      </Modal>
    </>
  );
}
