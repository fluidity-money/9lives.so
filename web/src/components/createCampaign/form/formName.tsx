import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { Field } from "@headlessui/react";
import Input from "@/components/themed/input";
import Label from "@/components/themed/label";
import { FieldError, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { combineClass } from "@/utils/combineClass";
import { fieldClass } from "../createCampaignForm";
import ErrorInfo from "@/components/themed/errorInfo";
import AIActive from "#/icons/ai-black.svg";
import AIInactive from "#/icons/ai-sad.svg";
import { useEffect, useState } from "react";
import Image from "next/image";
import useAiTitles from "@/hooks/useAiTitles";
export default function CreateCampaignFormName({
  register,
  setValue,
  error,
}: {
  register: UseFormRegister<{ name: string } & any>;
  setValue: UseFormSetValue<{ name: string } & any>;
  error?: FieldError;
}) {
  const [aiEnabled, SetAiEnabled] = useState(false);
  const [selectedAITitle, setSelectedAITitle] = useState<string>("");
  const { data: aiTitles, isLoading } = useAiTitles(aiEnabled);
  useEffect(() => {
    setSelectedAITitle("");
    setValue("name", "");
  }, [aiEnabled]);
  return (
    <Field className={fieldClass}>
      <div className="flex items-center justify-between">
        <Label text="Campaign Name" required />{" "}
        <div
          onClick={() => SetAiEnabled(!aiEnabled)}
          className={combineClass(
            aiEnabled
              ? "bg-9green shadow-9aiButtonEnabled"
              : "bg-9gray shadow-9aiButtonDisabled",
            "flex cursor-pointer items-center gap-1 rounded-[2px] border border-9black px-2.5 py-2",
          )}
        >
          <Image width={14} src={aiEnabled ? AIActive : AIInactive} alt="" />
          <span className="font-chicago text-xs">A.I Assist</span>
        </div>
      </div>
      <Input
        {...register("name")}
        className={combineClass(error && "border-2 border-red-500")}
        placeholder="Name"
        hidden={aiEnabled}
      />
      {!aiEnabled ? null : (
        <Listbox
          value={selectedAITitle}
          onChange={(v) => {
            setValue("name", v);
            setSelectedAITitle(v);
          }}
        >
          <ListboxButton
            className={combineClass(
              selectedAITitle ? "text-9black" : "text-[#999]",
              "border border-9black bg-9gray px-4 py-2 text-left font-geneva text-sm shadow-9input focus:outline-none focus-visible:ring-1 focus-visible:ring-9black",
            )}
          >
            {isLoading
              ? "Titles are generating..."
              : selectedAITitle || "Select an A.I suggested title"}
          </ListboxButton>
          <ListboxOptions
            anchor="bottom"
            transition
            className={combineClass(
              "w-[var(--button-width)] border border-9black bg-9gray p-1 font-geneva text-sm text-9black shadow-9input [--anchor-gap:var(--spacing-1)] focus:outline-none",
              "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
            )}
          >
            {" "}
            {aiTitles?.slice(0, 50).map((title) => (
              <ListboxOption
                key={title}
                value={title}
                onClick={() => {
                  setValue("name", title);
                  setSelectedAITitle(title);
                }}
                className="rounded-0 group flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-9blueLight"
              >
                <div className="text-sm/6">{title}</div>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>
      )}
      {error && <ErrorInfo text={error.message} />}
    </Field>
  );
}
