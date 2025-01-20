"use client";
import DegenModeListItem from "./degenModeListItem";
import { useDegenStore } from "@/stores/degenStore";
import { useQuery } from "@tanstack/react-query";
import { Action } from "@/types";

export default function DegenModeList() {
  const { data: actions } = useQuery<Action[]>({ queryKey: ["actions"] });
  const degenModeEnabled = useDegenStore((state) => state.degenModeEnabled);
  if (!degenModeEnabled) return null;
  return (
    <div className="hidden h-auto w-[400px] overflow-y-hidden border-l-2 border-l-9black bg-9layer md:relative md:flex">
      <div className="absolute inset-0 flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2.5">
          <h5 className="block text-right font-chicago text-xs">
            🐵 Degen Timeline 🐵
          </h5>
          <div className="h-px w-full bg-9black" />
        </div>
        <ul className="flex flex-col gap-5">
          {actions?.map((item) => (
            <li key={item.id}>
              <DegenModeListItem data={item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
