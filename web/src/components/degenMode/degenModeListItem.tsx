import { Action } from "@/types";

export default function DegenModeListItem({ data }: { data: Action }) {
  return <div>{data.id}</div>;
}
