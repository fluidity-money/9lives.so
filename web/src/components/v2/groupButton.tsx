import useDebouncedCallback from "@/hooks/useDebounceCallback";
import { combineClass } from "@/utils/combineClass";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface GroupButtonProps {
  callback?: () => void;
  title: string;
}
export default function GroupButton({
  buttons,
  className,
  initialIdx = 0,
}: {
  buttons: GroupButtonProps[];
  className?: string;
  initialIdx?: number;
}) {
  const [idx, setIdx] = useState(initialIdx);
  const [controllerIdx, setControllerIdx] = useState(initialIdx);

  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const totalWidth = containerRef.current.clientWidth;
    setButtonWidth((totalWidth - 8) / buttons.length);
  }, [buttons.length]);

  const debouncedCallback = useDebouncedCallback((index: number) => {
    buttons[index]?.callback?.();
    setIdx(index);
  }, 2000);

  useEffect(() => {
    if (controllerIdx !== idx) {
      debouncedCallback(controllerIdx);
    }
  }, [idx, controllerIdx]);

  return (
    <div
      ref={containerRef}
      className={combineClass(
        "relative flex items-center rounded-xl bg-neutral-200 p-1 shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.70)]",
        className,
      )}
    >
      <div
        className="absolute bottom-1 top-1 rounded-lg bg-2white shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)] transition-transform duration-300 ease-in-out"
        style={{
          width: buttonWidth,
          transform: `translateX(${controllerIdx * buttonWidth}px)`,
        }}
      />
      {buttons.map((b, index) => (
        <div
          key={b.title}
          className={combineClass(
            controllerIdx === index ? "text-2black" : "text-neutral-400",
            "z-[10] flex-1 cursor-pointer p-2 text-center text-sm",
          )}
          onClick={() => setControllerIdx(index)}
        >
          {b.title}
        </div>
      ))}
    </div>
  );
}
