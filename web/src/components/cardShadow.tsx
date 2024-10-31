import { combineClass } from "@/utils/combineClass";
import React from "react";

export default function ShadowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={combineClass(
        className,
        "rounded-[3px] border border-9black bg-9layer shadow-9card",
      )}
    >
      {children}
    </div>
  );
}
