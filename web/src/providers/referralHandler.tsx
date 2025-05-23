import RefereeDialog from "@/components/referral/refereeDialog";
import Modal from "@/components/themed/modal";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReferralHandler() {
  const searchParams = useSearchParams();
  const code = searchParams.get("referral");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (code) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [code]);

  useEffect(() => {
    if (isModalOpen) {
      setIsModalOpen(true);
    }
  }, [isModalOpen]);

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
