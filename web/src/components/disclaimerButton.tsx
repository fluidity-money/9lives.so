"use client";

import { useState } from "react";
import Modal from "./themed/modal";
import Image from "next/image";
import InfoIcon from "#/icons/info.svg";
import Disclaimer from "./disclaimer";
import { combineClass } from "@/utils/combineClass";
export default function DisclaimerButton({
  isInFooter = false,
}: {
  isInFooter?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <button
        className={combineClass(
          !isInFooter && "h-10 px-4 md:border-l-2",
          "flex items-center justify-center gap-1 border-9black",
        )}
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
