"use client";
import { useState } from "react";
import Modal from "../themed/modal";
import ReferrerlDialog from "./referrerDialog";
import useConnectWallet from "@/hooks/useConnectWallet";
import { combineClass } from "@/utils/combineClass";
import { useAppKitAccount } from "@reown/appkit/react";

export default function ReferralButton({
  hideOnMobile = true,
}: {
  hideOnMobile?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { connect } = useConnectWallet();
  const account = useAppKitAccount();
  function handleClick() {
    if (!account.isConnected) return connect();
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
