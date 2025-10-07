"use client";
import { useState } from "react";
import Modal from "../themed/modal";
import ReferrerlDialog from "./referrerDialog";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { combineClass } from "@/utils/combineClass";

export default function ReferralButton({
  hideOnMobile = true,
}: {
  hideOnMobile?: boolean;
}) {
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
        className={combineClass(
          hideOnMobile ? "hidden md:flex" : "flex",
          "h-10 cursor-pointer items-center justify-center px-4 font-chicago md:border-l-2 md:border-l-black",
        )}
      >
        <span
          className={hideOnMobile ? "hidden xl:inline" : "text-xs underline"}
        >
          Referral{" "}
        </span>
        🎁
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
