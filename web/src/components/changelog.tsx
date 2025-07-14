"use client";
import useChangelog from "@/hooks/useChangelog";
import { useEffect } from "react";
import Modal from "./themed/modal";
import { useModalStore } from "@/stores/modalStore";
import { useUserStore } from "@/stores/userStore";

export default function Changelog() {
  const { setModal, isModalOpen } = useModalStore();
  const { data, isSuccess } = useChangelog();
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);

  useEffect(() => {
    if (isSuccess && data && data[0]?.afterTs && !isInMiniApp) {
      const prevTime = window.localStorage.getItem("changelog");
      if (!prevTime || data[0].afterTs > Number(prevTime)) {
        setModal(true);
        window.localStorage.setItem("changelog", data[0]?.afterTs.toString());
      }
    }
  }, [isSuccess, data, setModal, isInMiniApp]);

  return (
    <Modal title="Changelog" isOpen={isModalOpen} setIsOpen={setModal}>
      <div
        dangerouslySetInnerHTML={{ __html: data?.[0]?.html ?? "" }}
        className="changelog"
      />
    </Modal>
  );
}
