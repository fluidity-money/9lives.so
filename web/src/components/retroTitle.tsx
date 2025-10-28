import CloseButton from "./closeButton";
import TitleBorders from "./titleBorders";
export interface RetroTitleProps {
  title: string;
  position?: "left" | "middle";
  showClose?: boolean;
  onClose?: () => void;
}
export default function RetroTitle({
  title,
  position = "left",
  showClose = true,
  onClose,
}: RetroTitleProps) {
  return (
    <div className="flex items-center gap-1 bg-[#CCC] px-2 py-1">
      {position === "left" ? null : <TitleBorders />}
      <span className="font-chicago text-xs uppercase leading-[13px]">
        {title}
      </span>
      <TitleBorders />
      {showClose && <CloseButton onClick={onClose} size="size-5" />}
    </div>
  );
}
