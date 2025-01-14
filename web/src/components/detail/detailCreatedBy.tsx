"use client";
import useMeowDomains from "@/hooks/useMeowDomains";
export default function DetailCreatedBy({
  address,
}: {
  address: `0x${string}`;
}) {
  const domain = useMeowDomains(address);
  return (
    <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      <a
        rel="noopener noreferrer"
        target="_blank"
        href={`https://explorer.superposition.so/address/${address}`}
      >
        Created by{" "}
        {domain.startsWith("0x")
          ? `${address.slice(0, 4)}...${address.slice(-4)}`
          : `${domain}.meow`}
      </a>
    </span>
  );
}
