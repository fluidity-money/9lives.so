/* eslint-disable @next/next/no-img-element */
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
import { Chain } from "thirdweb";
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
  let chains = isInMiniApp
    ? (JSON.parse(JSON.stringify(config.farcasterChains)) as Record<
        string,
        Chain
      >)
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
      <ListboxButton
        className={combineClass(
          variant === "default" ? "py-2 pl-2.5 pr-8" : "py-1 pl-1 pr-6 text-xs",
          "relative flex items-center gap-1 rounded-[3px] border border-9black shadow-9btnSecondaryIdle",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
        )}
      >
        {selectedChain?.icon ? (
          <Image
            src={selectedChain.icon as any}
            alt={selectedChain.name ?? ""}
            width={20}
            height={20}
          />
        ) : null}
        <span className="font-chicago">{selectedChain?.name}</span>
        <Image
          src={DownIcon}
          alt=""
          width={variant === "default" ? 16 : 10}
          className={combineClass(
            variant === "default" ? "size-4" : "size-2.5",
            "group pointer-events-none absolute right-2.5 top-2.5 fill-white/60",
          )}
          aria-hidden="true"
        />
      </ListboxButton>
      <ListboxOptions
        anchor={{ to: "bottom", gap: 4 }}
        transition
        className={combineClass(
          variant === "small" && "text-xs",
          "w-max rounded-[3px] border border-9black bg-9layer p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
          "z-30 transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
        )}
      >
        {chainList.map((chain) => (
          <ListboxOption
            key={chain.id}
            value={chain}
            className={
              "group flex cursor-default select-none items-center justify-between gap-2 px-3 py-1.5 data-[focus]:bg-9blueLight"
            }
          >
            <div className="flex items-center gap-2">
              {chain.icon ? (
                <Image
                  src={chain.icon as any}
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
