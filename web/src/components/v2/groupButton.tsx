import useDebouncedCallback from "@/hooks/useDebounceCallback";
import { GroupButtonProps } from "@/types";
import { combineClass } from "@/utils/combineClass";
import { useState, useMemo, useEffect } from "react";

interface GroupButtonComponentProps {
  buttons: GroupButtonProps[];
  className?: string;
  initialIdx?: number;
  initialDelay?: number;
  variant?: "default" | "small";
}

export default function GroupButton({
  buttons,
  className,
  initialIdx = 0,
  initialDelay = 300,
  variant = "default",
}: GroupButtonComponentProps) {
  const [activeIndex, setActiveIndex] = useState(initialIdx);

  const widthPercentage = useMemo(() => 100 / buttons.length, [buttons.length]);

  const triggerDebouncedCallback = useDebouncedCallback((index: number) => {
    buttons[index]?.callback?.();
  }, initialDelay);

  const handleClick = (index: number) => {
    setActiveIndex(index);
    triggerDebouncedCallback(index);
  };

  useEffect(() => {
    setActiveIndex(initialIdx);
  }, [initialIdx]);

  return (
    <div
      className={combineClass(
        "relative flex flex-row items-center rounded-xl bg-neutral-200 p-1 shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.70)]",
        className,
      )}
    >
      <div
        className="absolute inset-y-1 rounded-lg bg-2white shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)] transition-all duration-300 ease-in-out"
        style={{
          width: `calc(${widthPercentage}% - 8px)`,
          left: `calc(${activeIndex * widthPercentage}% + 4px)`,
        }}
      />
      {buttons.map((b, index) => (
        <div
          key={b.title}
          onClick={() => handleClick(index)}
          style={{ width: `${widthPercentage}%` }}
          className={combineClass(
            "z-10 cursor-pointer text-center text-sm transition-colors duration-200",
            variant === "default" ? "p-2" : "px-2 py-1",
            activeIndex === index
              ? `font-medium ${b.textColor ?? "text-2black"}`
              : "text-neutral-400",
          )}
        >
          {b.title}
        </div>
      ))}
    </div>
  );
}
