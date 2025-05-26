"use client";
import useChangelog from "@/hooks/useChangelog";
import { useEffect, useState } from "react";
import Modal from "./themed/modal";

export default function Changelog() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isSuccess } = useChangelog();

  useEffect(() => {
    if (isSuccess && data && data[0]?.afterTs) {
      const prevTime = window.localStorage.getItem("changelog");
      if (data[0].afterTs > Number(prevTime)) {
        setIsOpen(true);
      }
      window.localStorage.setItem("changelog", data[0]?.afterTs.toString());
    }
  }, [isSuccess, data]);

  return (
    <Modal title="Changelog" isOpen={isOpen} setIsOpen={setIsOpen}>
      <div
        dangerouslySetInnerHTML={{ __html: data?.[0]?.html ?? "" }}
        className="changelog"
      />
    </Modal>
  );
}
