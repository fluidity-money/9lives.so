import { Outcome } from "@/types";
import { Description, Field, Label, Select } from "@headlessui/react";
import Image from "next/image";
import DownIcon from "#/icons/down-caret.svg";
import { combineClass } from "@/utils/combineClass";
import Button from "./themed/button";
import useCountdown from "@/hooks/useCountdown";
export default function ProposeOutcome({
  title,
  ending,
  outcomes,
}: {
  title: string;
  ending: number;
  outcomes: Outcome[];
}) {
  const timeLeft = useCountdown(ending);
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-center font-chicago text-xl">{title}</h4>
      <div className="flex items-center justify-between">
        <span
          className={
            "bg-9yellow px-1 py-0.5 font-geneva text-xs uppercase text-9black"
          }
        >
          End Date: {new Date(ending).toDateString()}
        </span>
        <span
          className={
            "bg-9yellow px-1 py-0.5 font-geneva text-xs uppercase text-9black"
          }
        >
          Time left to dispute: {timeLeft}
        </span>
      </div>
      <div className="w-full text-9black">
        <Field>
          <Label className="text-sm/6 font-medium">
            Your proposed outcome will be utilized in 9lives&apos; oracle.
          </Label>
          <Description className="text-sm/6 text-9black/50">
            By participating in this outcome proposal you agree to lock-up your
            staked $ARB tokens until 1 week after the market&apos;s end date.
          </Description>
          <div className="relative">
            <Select
              className={combineClass(
                "mt-3 block w-full appearance-none border border-9black bg-9gray px-4 py-2 font-geneva text-sm text-9black shadow-9input",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
              )}
            >
              {outcomes.map((outcome) => (
                <option key={outcome.identifier} value={outcome.identifier}>
                  {outcome.name}
                </option>
              ))}
            </Select>
            <Image
              alt=""
              width={16}
              src={DownIcon}
              className="group pointer-events-none absolute right-2.5 top-2.5 size-4"
              aria-hidden="true"
            />
          </div>
        </Field>
      </div>
      <p className="text-sm/6 text-9black/50">
        Participating in more outcome proposals result in higher potential yield
        per staked $ARB
      </p>
      <Button intent={"yes"} size={"large"} title="SUBMIT" onClick={() => {}} />
    </div>
  );
}
