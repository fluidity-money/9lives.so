import { combineClass } from "@/utils/combineClass";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Image from "next/image";
import { useState } from "react";
import DownIcon from "#/icons/down-caret.svg";
import CheckIcon from "#/icons/check.svg";
import FUSDCImg from "#/images/fusdc.png";
const assets = [
  {
    img: FUSDCImg,
    name: "fUSDC",
  },
];
export default function AssetSelector() {
  const [selected, setSelected] = useState(assets[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <ListboxButton
        className={combineClass(
          "relative flex items-center gap-1 rounded-[3px] border border-9black py-2 pl-2.5 pr-8 shadow-9btnSecondaryIdle",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
        )}
      >
        <Image src={selected.img} alt="fusdc" width={20} />
        <span className="font-chicago">{selected.name}</span>
        <Image
          src={DownIcon}
          alt=""
          width={16}
          className="group pointer-events-none absolute right-2.5 top-2.5 size-4 fill-white/60"
          aria-hidden="true"
        />
      </ListboxButton>
      <ListboxOptions
        anchor={{ to: "bottom", gap: 4 }}
        transition
        className={combineClass(
          "w-[var(--button-width)] rounded-[3px] border border-9black bg-9layer p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
          "z-30 transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
        )}
      >
        {assets.map((asset) => (
          <ListboxOption
            key={asset.name.toLowerCase()}
            value={asset}
            className="group flex cursor-default select-none items-center gap-2 px-3 py-1.5 data-[focus]:bg-9blueLight"
          >
            <Image
              src={CheckIcon}
              className="invisible size-4 group-data-[selected]:visible"
              alt=""
              width={16}
            />
            <div className="font-chicago">{asset.name}</div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
