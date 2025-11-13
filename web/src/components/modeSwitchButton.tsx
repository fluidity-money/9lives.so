"use client";
import { combineClass } from "@/utils/combineClass";
import { Switch } from "@headlessui/react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { useRef, useCallback } from "react";

function useDebouncedCallback(
  callback: (...args: any[]) => void,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  );
}

export default function ModeSwitchButton() {
  const [enabled, setEnabled] = useState<boolean>();
  const router = useRouter();

  useEffect(() => {
    posthog.register({ isAdvancedMode: enabled ?? false });
  }, [enabled]);

  useEffect(() => {
    (async function () {
      const initialState = await window.cookieStore.get("advanced-mode");
      if (initialState && initialState.value === "true") {
        setEnabled(true);
      } else {
        setEnabled(false);
      }
    })();
  }, []);

  const handleToggle = useDebouncedCallback(async () => {
    if (enabled) {
      await window.cookieStore.set("advanced-mode", "false");
    } else {
      await window.cookieStore.set("advanced-mode", "true");
    }
    router.push("/");
  }, 500);

  return (
    <div
      onClick={() => {
        setEnabled(!enabled);
        handleToggle();
      }}
      className={combineClass(
        "relative flex h-10 cursor-pointer items-center gap-1 border-l-2 border-l-9black px-4 focus:outline-none",
      )}
    >
      <span className="hidden font-chicago text-xs underline md:inline">
        Advanced Mode
      </span>
      <Switch
        checked={enabled ?? false}
        className="group inline-flex h-6 w-11 items-center bg-9layer transition data-[checked]:bg-9black"
      >
        <span className="size-4 translate-x-1 bg-9black text-xs transition group-data-[checked]:translate-x-6 group-data-[checked]:bg-9layer">
          {enabled ? "🚀" : "🐣"}
        </span>
      </Switch>
    </div>
  );
}
