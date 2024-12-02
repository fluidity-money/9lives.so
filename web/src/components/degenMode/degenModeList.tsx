// import { useQuery } from "@tanstack/react-query";
// import DegenModeListItem from "./degenModeListItem";
// import { Action } from "@/types";

export default function DegenModeList() {
  // const { data, isLoading } = useQuery<Action[]>({ queryKey: ["actions"] });

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-2.5">
        <h5 className="block text-right font-chicago text-xs">
          🐵 Degen Timeline 🐵
        </h5>
        <div className="h-[1px] w-full bg-9black" />
      </div>
      <p className="text-center font-chicago text-base">Coming Soon</p>
      {/* {isLoading ? (
        <div>Loading</div>
      ) : (
        <ul className="flex flex-col gap-5">
          {data?.map((item) => (
            <li key={item.id}>
              <DegenModeListItem data={item} />
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
}
