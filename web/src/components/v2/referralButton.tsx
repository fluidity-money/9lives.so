"use client";
import { useState } from "react";
import Modal from "./modal";
import ReferrerlDialog from "./referrerDialog";
import useConnectWallet from "@/hooks/useConnectWallet";
import { useAppKitAccount } from "@reown/appkit/react";
import Button from "./button";
import { combineClass } from "@/utils/combineClass";

export default function ReferralButton({
  shouldHideOnMobile = false,
  inverted = false,
}: {
  shouldHideOnMobile?: boolean;
  inverted?: boolean;
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
      <Button
        title="Referral"
        intent={inverted ? "inverted" : "cta"}
        onClick={handleClick}
        className={combineClass(shouldHideOnMobile && "hidden md:block")}
        icon={
          <svg
            width="15"
            height="13"
            viewBox="0 0 15 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.8739 4.17063L11.3739 0.170625C11.3271 0.117177 11.2694 0.0743143 11.2048 0.0448933C11.1401 0.0154722 11.0699 0.000167965 10.9989 0H3.99887C3.92783 0.000167965 3.85764 0.0154722 3.79298 0.0448933C3.72832 0.0743143 3.67067 0.117177 3.62387 0.170625L0.123874 4.17063C0.0422222 4.26385 -0.00190036 4.38407 6.28034e-05 4.50798C0.00202597 4.63189 0.0499349 4.75066 0.134499 4.84125L7.1345 12.3413C7.18128 12.3914 7.23788 12.4314 7.30078 12.4587C7.36368 12.4861 7.43154 12.5002 7.50012 12.5002C7.56871 12.5002 7.63656 12.4861 7.69946 12.4587C7.76236 12.4314 7.81896 12.3914 7.86575 12.3413L14.8657 4.84125C14.95 4.75035 14.9974 4.63141 14.9989 4.5075C15.0004 4.38359 14.9559 4.26354 14.8739 4.17063ZM13.397 4H10.7489L8.49887 1H10.772L13.397 4ZM4.16012 5L6.04325 9.70813L1.6495 5H4.16012ZM10.8376 5H13.3482L8.9545 9.70813L10.8376 5ZM4.22575 1H6.49887L4.24887 4H1.60075L4.22575 1Z"
              fill="currentColor"
            />
          </svg>
        }
      />
      <Modal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        boxContainerClass="max-w-[600px]"
      >
        <ReferrerlDialog closeModal={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}
