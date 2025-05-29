import { combineClass } from "@/utils/combineClass";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Image from "next/image";
import { useEffect } from "react";
import DownIcon from "#/icons/down-caret.svg";
import CheckIcon from "#/icons/check.svg";
import { currentChain } from "../config/chains";
import { Token } from "@/types";
export default function AssetSelector({
  fromChain,
  fromToken,
  setValue,
  isSuccess,
  tokens,
}: {
  fromChain: number;
  fromToken: string;
  setValue: (addr: string) => void;
  isSuccess: boolean;
  tokens?: Token[];
}) {
  useEffect(() => {
    if (fromChain !== currentChain.id && isSuccess && tokens) {
      setValue(tokens[0].address);
    }
  }, [fromChain, isSuccess, tokens]);

  return (
    <Listbox value={fromToken} onChange={(selected) => setValue(selected)}>
      <ListboxButton
        className={combineClass(
          "relative flex items-center gap-1 rounded-[3px] border border-9black py-2 pl-2.5 pr-8 shadow-9btnSecondaryIdle",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
        )}
      >
        {isSuccess && Boolean(tokens?.find((t) => t.address === fromToken)) ? (
          <img
            src={tokens?.find((t) => t.address === fromToken)?.logoURI}
            alt="fusdc"
            width={20}
            height={20}
          />
        ) : (
          <div className="bg-gray/50 size-5 rounded-full" />
        )}
        <span className="font-chicago">
          {tokens?.find((t) => t.address === fromToken)?.symbol ?? "USDC"}
        </span>
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
          "w-max rounded-[3px] border border-9black bg-9layer p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
          "z-30 transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
        )}
      >
        {tokens?.map((token) => (
          <ListboxOption
            key={token.address}
            value={token.address}
            className="group flex cursor-default select-none items-center gap-2 px-3 py-1.5 data-[focus]:bg-9blueLight"
          >
            {token.logoURI ? (
              <img
                src={token.logoURI}
                alt={token.name}
                width={20}
                height={20}
              />
            ) : null}
            <div className="font-chicago">
              {token.name.slice(0, 20)}
              {token.name.length > 20 && "..."}
            </div>
            <Image
              src={CheckIcon}
              className="invisible size-4 group-data-[selected]:visible"
              alt=""
              width={16}
            />
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
