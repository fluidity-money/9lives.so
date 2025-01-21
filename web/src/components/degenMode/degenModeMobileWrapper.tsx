import Modal from "../themed/modal";
import DegenModeList from "./degenModeList";
import { useState } from "react";

export default function DegenModeMobileWrapper() {
  const [isDegenMobileOpen, setIsDegenMobileOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsDegenMobileOpen(true)}
        className="flex h-10 items-center justify-center"
      >
        <span className="font-chicago text-xs underline">🐵 Degen Mode 🐵</span>
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
