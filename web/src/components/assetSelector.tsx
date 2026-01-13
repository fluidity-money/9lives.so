/* eslint-disable @next/next/no-img-element */
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
import { Token } from "@/types";
import { formatUnits, zeroAddress } from "viem";
export default function AssetSelector({
  fromChain,
  fromToken,
  setValue,
  isSuccess,
  tokens,
  tokensWithBalances,
  variant = "default",
}: {
  fromChain: number;
  fromToken: string;
  setValue: (addr: string) => void;
  isSuccess: boolean;
  tokens?: Token[];
  tokensWithBalances?: { balance: bigint; address: string }[];
  variant?: "default" | "small";
}) {
  useEffect(() => {
    if (isSuccess && tokens?.length) {
      setValue(tokens[0].address);
    }
  }, [fromChain, isSuccess, tokens, setValue]);

  const enrichedTokens = tokens
    ?.map((t) => {
      const tokenWithBalance = tokensWithBalances?.find(
        (tb) =>
          tb.address.toLowerCase() === t.address.toLowerCase() ||
          (tb.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" &&
            t.address === zeroAddress),
      );
      return {
        ...t,
        balance: tokenWithBalance
          ? +formatUnits(tokenWithBalance.balance, t.decimals)
          : 0,
      };
    })
    .sort((a, b) => b.balance - a.balance);

  return (
    <Listbox value={fromToken} onChange={(selected) => setValue(selected)}>
      <ListboxButton
        className={combineClass(
          variant === "default" ? "py-2 pl-2.5 pr-8" : "py-1 pl-1 pr-6 text-xs",
          "relative flex items-center gap-1 rounded-[3px] border border-9black shadow-9btnSecondaryIdle",
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
          <div className="size-5 rounded-full bg-9gray" />
        )}
        <span className="font-chicago">
          {tokens?.find((t) => t.address === fromToken)?.symbol ?? "ETH"}
        </span>
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
        {enrichedTokens?.map((token) => (
          <ListboxOption
            key={token.address}
            value={token.address}
            disabled={!token.balance}
            className={combineClass(
              !token.balance && "opacity-50",
              "group flex cursor-default select-none items-center justify-between gap-2 px-3 py-1.5 data-[focus]:bg-9blueLight",
            )}
          >
            <div className="flex items-center gap-2">
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
                className={combineClass(
                  variant === "default" ? "size-4" : "size-2.5",
                  "invisible group-data-[selected]:visible",
                )}
                alt=""
                width={variant === "default" ? 16 : 10}
              />
            </div>
            <span className="font-geneva text-xs">{token.balance}</span>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
