"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SimpleModeAlert() {
  const [displayAlert, setDisplayAlert] = useState(false);
  const router = useRouter();
  async function switchToAdvanced() {
    await window.cookieStore.set("advanced-mode", "true");
    router.push("/");
  }
  useEffect(() => {
    (async function () {
      const cookie = await window.cookieStore.get("advanced-mode");
      if (cookie === null) {
        setDisplayAlert(true);
      }
    })();
  }, []);

  if (!displayAlert) return null;

  return (
    <div className="flex flex-col gap-2 rounded-[3px] border-[1.5px] border-9black bg-white px-2 py-1 text-center text-xs md:px-4 md:py-3">
      <h4 className="font-chicago">
        Simple Mode: Get started predicting the future with hourly markets
      </h4>
      <h5>
        Once you&apos;re ready, create your own markets and trade using{" "}
        <span className="cursor-pointer underline" onClick={switchToAdvanced}>
          advanced mode
        </span>
        .
      </h5>
    </div>
  );
}
