"use client";

import { useEffect, useState } from "react";
import Modal from "./themed/modal";
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
        className="flex h-10 items-center justify-center gap-1 border-9black px-4 md:border-l-2"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="font-chicago text-xs underline md:hidden lg:inline">
          How It Works
        </span>{" "}
        <Image src={InfoIcon} className="w-5 md:w-4" alt="How it works?" />
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
