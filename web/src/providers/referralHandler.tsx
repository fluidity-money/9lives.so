import RefereeDialog from "@/components/referral/refereeDialog";
import Modal from "@/components/themed/modal";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ReferralHandler() {
  const searchParams = useSearchParams();
  const code = searchParams.get("referral");
  const [isModalOpen, setIsModalOpen] = useState(() => Boolean(code));

  if (!code) return null;

  return (
    <Modal
      title="Referral System"
      isOpen={isModalOpen}
      setIsOpen={setIsModalOpen}
    >
      <RefereeDialog code={code} close={() => setIsModalOpen(false)} />
    </Modal>
  );
}
