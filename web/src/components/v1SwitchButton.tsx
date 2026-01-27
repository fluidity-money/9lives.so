"use client";
import useDebouncedCallback from "@/hooks/useDebounceCallback";
import { combineClass } from "@/utils/combineClass";
import { Switch } from "@headlessui/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function VersionSwitchButton() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState<boolean>(pathname.startsWith("/v1"));
  const router = useRouter();

  const handleToggle = useDebouncedCallback(async () => {
    if (enabled) {
      router.push("/");
    } else {
      router.push("/v1");
    }
  }, 300);

  return (
    <div
      onClick={() => {
        setEnabled(!enabled);
        handleToggle();
      }}
      className={combineClass(
        "relative flex h-10 cursor-pointer items-center gap-1 focus:outline-none",
      )}
    >
      <span className="hidden font-chicago text-xs underline lg:inline">
        Version
      </span>
      <Switch
        id="advanced-mode-switch"
        checked={enabled ?? false}
        className="group inline-flex h-6 w-11 items-center bg-9layer transition data-[checked]:bg-9black"
      >
        <span
          className={combineClass(
            "size-4 translate-x-1 bg-9black text-xs text-9layer transition group-data-[checked]:translate-x-6 group-data-[checked]:bg-9layer group-data-[checked]:text-9black",
          )}
        >
          {enabled ? "v1" : "v2"}
        </span>
      </Switch>
    </div>
  );
}
