import DegenModeListItem from "./degenModeListItem";
import { useDegenStore } from "@/stores/degenStore";

export default function DegenModeList() {
  const actions = useDegenStore((state) => state.actions);
  return (
    <div className="flex flex-col gap-5 p-5">
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
  );
}
