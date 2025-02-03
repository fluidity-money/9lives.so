"use client";
import { useState } from "react";
import Modal from "../themed/modal";
import DegenModeList from "./degenModeList";

export default function DegenModeFloatingButton() {
  const [isDegenMobileOpen, setIsDegenMobileOpen] = useState(false);
  function handleClick() {
    setIsDegenMobileOpen(true);
  }
  return (
    <>
      <button
        id="degen-floating-button"
        onClick={handleClick}
        className="fixed bottom-2 left-2 size-10 rounded-sm border border-9black bg-9layer text-base shadow-9btnPrimaryIdle hover:shadow-9btnPrimaryHover focus:outline-none focus-visible:shadow-9btnPrimaryFocus active:shadow-9btnPrimaryActive disabled:shadow-9btnPrimaryDisabled md:hidden"
      >
        🐵
      </button>
      <Modal
        isOpen={isDegenMobileOpen}
        setIsOpen={setIsDegenMobileOpen}
        title="🐵 Degen Timeline 🐵"
      >
        <DegenModeList />
      </Modal>
    </>
  );
}
