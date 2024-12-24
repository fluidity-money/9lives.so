"use client";
import { useUserStore } from "@/stores/userStore";
import DegenModeListItem from "./degenModeListItem";
import { useDegenStore } from "@/stores/degenStore";

export default function DegenModeList() {
  const actions = useDegenStore((state) => state.actions);
  const degenModeEnabled = useUserStore((state) => state.degenModeEnabled);
  if (!degenModeEnabled) return null;
  return (
    <div className="relative h-auto w-[400px] overflow-y-hidden border-l-2 border-l-9black bg-9layer">
      <div className="absolute inset-0 flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2.5">
          <h5 className="block text-right font-chicago text-xs">
            🐵 Degen Timeline 🐵
          </h5>
          <div className="h-px w-full bg-9black" />
        </div>
        <ul className="flex flex-col gap-5">
          {actions.map((item) => (
            <li key={item.id}>
              <DegenModeListItem data={item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
