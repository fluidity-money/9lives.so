import useDebouncedCallback from "@/hooks/useDebounceCallback";
import { combineClass } from "@/utils/combineClass";
import { useState, useMemo } from "react";

export interface GroupButtonProps {
  callback?: () => void;
  title: string;
}

interface GroupButtonComponentProps {
  buttons: GroupButtonProps[];
  className?: string;
  initialIdx?: number;
}

export default function GroupButton({
  buttons,
  className,
  initialIdx = 0,
}: GroupButtonComponentProps) {
  const [activeIndex, setActiveIndex] = useState(initialIdx);

  const widthPercentage = useMemo(() => 100 / buttons.length, [buttons.length]);

  const triggerDebouncedCallback = useDebouncedCallback((index: number) => {
    buttons[index]?.callback?.();
  }, 500);

  const handleCreate = (index: number) => {
    setActiveIndex(index);
    triggerDebouncedCallback(index);
  };

  return (
    <div
      className={combineClass(
        "relative flex items-center rounded-xl bg-neutral-200 p-1 shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.70)]",
        className,
      )}
    >
      <div
        className="absolute bottom-1 top-1 rounded-lg bg-2white shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)] transition-all duration-300 ease-in-out"
        style={{
          width: `calc(${widthPercentage}% - 8px)`,
          left: `calc(${activeIndex * widthPercentage}% + 4px)`,
        }}
      />
      {buttons.map((b, index) => (
        <div
          key={b.title}
          onClick={() => handleCreate(index)}
          style={{ width: `${widthPercentage}%` }}
          className={combineClass(
            "z-10 cursor-pointer p-2 text-center text-sm transition-colors duration-200",
            activeIndex === index
              ? "font-medium text-2black"
              : "text-neutral-400",
          )}
        >
          {b.title}
        </div>
      ))}
    </div>
  );
}
