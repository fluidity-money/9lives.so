import CloseButton from "./closeButton";
import TitleBorders from "./titleBorders";

export default function RelayTxToaster({
  tx,
  close,
}: {
  tx: string;
  close: () => void;
}) {
  return (
    <div className="rounded-[3px] border border-9black bg-9layer shadow-9card">
      <div className="flex flex-row gap-1 rounded-t-[3px] bg-[#CCC] px-2 py-1">
        <span className="font-chicago text-xs leading-[13px]">Tx Details</span>
        <TitleBorders />
        <CloseButton size="size-4" onClick={close} />
      </div>
      <a
        className="m-4 block font-chicago text-xs underline"
        target="_blank"
        href={`https://relay.link/transaction/${tx}`}
      >
        Click to check your tx details
      </a>
    </div>
  );
}
