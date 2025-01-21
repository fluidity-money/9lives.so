import DegenModeListItem from "./degenModeListItem";
import { useQuery } from "@tanstack/react-query";
import { Action } from "@/types";

export default function DegenModeList() {
  const { data: actions } = useQuery<Action[]>({ queryKey: ["actions"] });
  return (
    <ul className="flex flex-col gap-5">
      {actions?.map((item) => (
        <li key={item.id}>
          <DegenModeListItem data={item} />
        </li>
      ))}
    </ul>
  );
}
