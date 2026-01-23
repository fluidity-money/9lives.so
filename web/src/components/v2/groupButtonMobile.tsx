import useDebouncedCallback from "@/hooks/useDebounceCallback";
import { GroupButtonProps } from "@/types";
import { combineClass } from "@/utils/combineClass";
import { useState } from "react";

interface GroupButtonComponentProps {
  buttons: GroupButtonProps[];
  className?: string;
  initialIdx?: number;
}

export default function GroupButtonMobile({
  buttons,
  className,
  initialIdx = 0,
}: GroupButtonComponentProps) {
  const [activeIndex, setActiveIndex] = useState(initialIdx);

  const triggerDebouncedCallback = useDebouncedCallback((index: number) => {
    buttons[index]?.callback?.();
  }, 300);

  const handleCreate = () => {
    setActiveIndex((index) => (index + 1 >= buttons.length ? 0 : index + 1));
    triggerDebouncedCallback(
      activeIndex + 1 >= buttons.length ? 0 : activeIndex + 1,
    );
  };

  return (
    <div
      className={combineClass(
        "relative flex items-center rounded-xl bg-neutral-200 p-1 shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.70)]",
        className,
      )}
    >
      {" "}
      <div
        key={buttons[activeIndex].mobileTitle}
        onClick={handleCreate}
        className={combineClass(
          "z-10 cursor-pointer rounded-lg bg-2white px-2 py-1 text-center text-sm font-medium text-2black shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)] transition-colors duration-200",
        )}
      >
        {buttons[activeIndex].mobileTitle}
      </div>
    </div>
  );
}
