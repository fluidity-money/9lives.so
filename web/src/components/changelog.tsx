"use client";
import useChangelog from "@/hooks/useChangelog";
import { useEffect } from "react";
import Modal from "./themed/modal";
import { useModalStore } from "@/stores/modalStore";

export default function Changelog() {
  const { setModal, isModalOpen } = useModalStore();
  const { data, isSuccess } = useChangelog();

  useEffect(() => {
    if (isSuccess && data && data[0]?.afterTs) {
      const prevTime = window.localStorage.getItem("changelog");
      if (data[0].afterTs > Number(prevTime)) {
        setModal(true);
      }
      window.localStorage.setItem("changelog", data[0]?.afterTs.toString());
    }
  }, [isSuccess, data]);

  return (
    <Modal title="Changelog" isOpen={isModalOpen} setIsOpen={setModal}>
      <div
        dangerouslySetInnerHTML={{ __html: data?.[0]?.html ?? "" }}
        className="changelog"
      />
    </Modal>
  );
}
