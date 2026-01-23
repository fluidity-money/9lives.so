import { combineClass } from "@/utils/combineClass";

export default function CloseButton({
  close,
  size,
}: {
  close: () => void;
  size?: string;
}) {
  return (
    <div
      className={combineClass(
        size ?? "size-10",
        "absolute right-2 top-2 z-10 flex cursor-pointer items-center justify-center rounded-full bg-2white/20 hover:bg-2black/10",
      )}
      onClick={close}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.5 3.5L3.5 12.5"
          stroke="#A3A3A3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 12.5L3.5 3.5"
          stroke="#A3A3A3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
