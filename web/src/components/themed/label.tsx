import { Label as LabelBase } from "@headlessui/react";

export default function Label({
  text,
  required = false,
}: {
  text: string;
  required: boolean;
}) {
  return (
    <div className="flex gap-2.5">
      <LabelBase aria-required={required} className="text-sm font-bold">
        {text}
      </LabelBase>
      {required && (
        <span className="bg-9yellow px-1.5 py-1 font-geneva text-[10px]">
          (Required)
        </span>
      )}
    </div>
  );
}
