"use client";
import { useState } from "react";
import Modal from "../themed/modal";
import ReferrerlDialog from "./referrerDialog";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function ReferralButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  function handleClick() {
    if (!account) return connect();
    setIsModalOpen(true);
  }
  return (
    <>
      <div
        onClick={handleClick}
        className="hidden h-10 cursor-pointer items-center justify-center border-l-2 border-l-black px-4 font-chicago xl:flex"
      >
        Referral 🎁
      </div>
      <Modal
        title="Referral System"
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      >
        <ReferrerlDialog />
      </Modal>
    </>
  );
}
