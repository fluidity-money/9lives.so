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
      <ListboxButton className="relative flex items-center gap-1">
        {isSuccess && Boolean(tokens?.find((t) => t.address === fromToken)) ? (
          <img
            src={tokens?.find((t) => t.address === fromToken)?.logoURI}
            alt="fusdc"
            className="rounded-full"
            width={20}
            height={20}
          />
        ) : (
          <div className="size-5 rounded-full bg-9gray" />
        )}
        <span className="underline">
          {tokens?.find((t) => t.address === fromToken)?.symbol ?? "ETH"}
        </span>
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
        {enrichedTokens?.map((token) => (
          <ListboxOption
            key={token.address}
            value={token.address}
            disabled={!token.balance}
            className={combineClass(
              !token.balance && "opacity-50",
              "group flex cursor-default select-none items-center justify-between gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-2black/10",
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
