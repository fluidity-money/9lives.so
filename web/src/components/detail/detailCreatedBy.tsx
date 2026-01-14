"use client";
import config from "@/config";
import useMeowDomains from "@/hooks/useMeowDomains";
import { combineClass } from "@/utils/combineClass";
export default function DetailCreatedBy({
  address,
  prefix = true,
  isCreator = false,
}: {
  address: `0x${string}`;
  prefix?: boolean;
  isCreator?: boolean;
}) {
  const { data: domain } = useMeowDomains(address);
  return (
    <div className="flex items-center">
      <span
        className={combineClass(
          isCreator ? "text-9blueDark" : "text-[#808080]",
          "font-geneva text-xs uppercase leading-3 tracking-wide",
        )}
      >
        <a
          rel="noopener noreferrer"
          target="_blank"
          href={`${config.destinationChain.blockExplorers.default.url}/address/${address}`}
        >
          {prefix && "Created by "}
          {domain?.startsWith("0x")
            ? `${address.slice(0, 4)}...${address.slice(-4)}`
            : domain}
        </a>
      </span>
      {isCreator ? (
        <span className="ml-1 bg-9blueDark p-0.5 font-geneva text-[10px] font-normal uppercase tracking-wide">
          Creator
        </span>
      ) : null}
    </div>
  );
}
