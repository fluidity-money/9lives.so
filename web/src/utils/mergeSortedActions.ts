import { Action } from "@/types";
export function mergeSortedActions(arr1: Action[], arr2: Action[]): Action[] {
  const filteredItems = arr2.filter(
    (item) => !arr1.map((b) => b.id).includes(item.id),
  );
  if (filteredItems.length > 0) {
    const merged = [...arr1, ...filteredItems].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return merged;
  } else return arr1;
}
