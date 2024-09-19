"use client";

import { useState } from "react";

export default function Clock() {
  const [date, setDate] = useState<Date>(new Date());

  setInterval(() => setDate(new Date()), 1000);
  return (
    <div className="flex h-10 items-center justify-center border-l-2 border-l-black px-4 font-chicago">
      {date.toLocaleTimeString("en", {
        year: undefined,
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}
    </div>
  );
}
