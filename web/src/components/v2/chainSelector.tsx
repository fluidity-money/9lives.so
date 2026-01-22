import { combineClass } from "@/utils/combineClass";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Image from "next/image";
import DownIcon from "#/icons/down-caret.svg";
import CheckIcon from "#/icons/check.svg";
import config from "@/config";
import { Chain } from "@/types";
export default function ChainSelectorDropdown({
  selectedChainId,
  handleNetworkChange,
  isInMiniApp,
  removeSPN,
  variant = "default",
}: {
  selectedChainId: number;
  isInMiniApp: boolean;
  handleNetworkChange: (chain: Chain) => void;
  removeSPN?: boolean;
  variant?: "default" | "small";
}) {
  const chains = isInMiniApp
    ? (JSON.parse(JSON.stringify(config.chains)) as Record<string, Chain>)
    : (JSON.parse(JSON.stringify(config.chains)) as Record<string, Chain>);
  if (removeSPN) {
    delete chains.superposition;
  }
  const chainList = Object.values(chains);
  const selectedChain = chainList.find((c) => c.id === selectedChainId);

  return (
    <Listbox
      value={selectedChain}
      onChange={(selected) => handleNetworkChange(selected)}
    >
      <ListboxButton className="relative flex items-center gap-1">
        {selectedChain?.icon ? (
          <Image
            src={selectedChain.icon}
            alt={selectedChain.name ?? ""}
            className="rounded-full"
            width={20}
            height={20}
          />
        ) : null}
        <span className="underline">{selectedChain?.name}</span>
        <svg
          width="11"
          height="10"
          viewBox="0 0 11 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.508 0L5.796 5.63014e-08V7.812L9.436 3.906L10.332 4.788L5.558 9.8H4.788L0 4.788L0.896 3.906L4.508 7.784V0Z"
            fill="#B5B5B5"
          />
        </svg>
      </ListboxButton>
      <ListboxOptions
        anchor={{ to: "bottom", gap: 4 }}
        transition
        className={combineClass(
          variant === "small" && "text-xs",
          "flex w-max flex-col gap-2 rounded-2xl bg-2white px-2 py-3 shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)] [--anchor-gap:var(--spacing-1)] focus:outline-none",
          "z-30 transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
        )}
      >
        {chainList.map((chain) => (
          <ListboxOption
            key={chain.id}
            value={chain}
            className={
              "group flex cursor-default select-none items-center justify-between gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-2black/10"
            }
          >
            <div className="flex items-center gap-2">
              {chain.icon ? (
                <Image
                  src={chain.icon}
                  alt={chain.name ?? ""}
                  width={20}
                  height={20}
                />
              ) : null}
              <div className="font-chicago">{chain.name}</div>
              <Image
                src={CheckIcon}
                className={combineClass(
                  variant === "default" ? "size-4" : "size-2.5",
                  "invisible group-data-[selected]:visible",
                )}
                alt=""
                width={variant === "default" ? 16 : 10}
              />
            </div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
