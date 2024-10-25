import CloseButton from "../closeButton";
import TitleBorders from "../titleBorders";

export default function DetailInfo({ data }: { data: string }) {
  return (
    <div className="rounded-[3px] border border-9black bg-9layer shadow-9card">
      <div className="flex flex-row gap-1 rounded-t-[3px] bg-[#CCC] px-2 py-1">
        <CloseButton size="size-3" />
        <span className="font-chicago text-xs leading-[13px]">
          RULES & RESOURCES
        </span>
        <TitleBorders />
      </div>
      <div className="p-5">
        <h5 className="mb-5 font-chicago text-sm">Overview</h5>
        <p className="text-xs">{data}</p>
      </div>
    </div>
  );
}
