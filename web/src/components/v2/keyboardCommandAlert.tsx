"use client";
import { useState } from "react";
import Button from "./button";
import Link from "next/link";
import CloseButton from "./closeButton";

export default function KeyboardCommandAlert() {
  const charStyle = "px-1 py-0.5 rounded-lg bg-neutral-200 text-2black";

  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 hidden max-w-[300px] rounded-2xl border border-neutral-400 bg-2white p-4 shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)] md:block">
      <CloseButton close={() => setDismissed(true)} />
      <h6 className="mb-4">Use Keyboard Actions</h6>
      <p className="mb-4 text-center text-xs leading-6">
        You can use quick keyboard shortcuts to navigate between assets and
        issue buy commands. Use <span className={charStyle}>⌘</span> +{" "}
        <span className={charStyle}>←</span> and{" "}
        <span className={charStyle}>→</span> to move between assets,{" "}
        <span className={charStyle}>↑</span> and{" "}
        <span className={charStyle}>↓</span> to predict whether the price will
        go up or down.
      </p>
      <Button
        title="Dismiss"
        intent={"cta"}
        className={"w-full"}
        onClick={() => setDismissed(true)}
      />
    </div>
  );
}
