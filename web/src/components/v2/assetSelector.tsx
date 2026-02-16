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
      <ListboxButton className="relative flex items-center gap-1 rounded-xl border border-neutral-400 px-3 py-2">
        {isSuccess && Boolean(tokens?.find((t) => t.address === fromToken)) ? (
          <img
            src={tokens?.find((t) => t.address === fromToken)?.logoURI}
            alt="fusdc"
            className="rounded-full"
            width={16}
            height={16}
          />
        ) : (
          <div className="size-5 rounded-full bg-9gray" />
        )}
        <span className="text-sm font-bold">
          {tokens?.find((t) => t.address === fromToken)?.symbol ?? "ETH"}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.7692 7.94594L10.5535 13.1616C10.4808 13.2345 10.3945 13.2924 10.2994 13.3319C10.2043 13.3714 10.1023 13.3917 9.99935 13.3917C9.89638 13.3917 9.79442 13.3714 9.69933 13.3319C9.60423 13.2924 9.51787 13.2345 9.44519 13.1616L4.22954 7.94594C4.08257 7.79897 4 7.59963 4 7.39178C4 7.18393 4.08257 6.98459 4.22954 6.83762C4.37651 6.69064 4.57585 6.60807 4.7837 6.60807C4.99155 6.60807 5.19089 6.69064 5.33787 6.83762L10 11.4997L14.6621 6.83696C14.8091 6.68999 15.0084 6.60742 15.2163 6.60742C15.4241 6.60742 15.6235 6.68999 15.7705 6.83696C15.9174 6.98394 16 7.18327 16 7.39113C16 7.59898 15.9174 7.79832 15.7705 7.94529L15.7692 7.94594Z"
            fill="#181818"
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
