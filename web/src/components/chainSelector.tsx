import config from "@/config";
import { combineClass } from "@/utils/combineClass";
import Image from "next/image";
import { Chain } from "thirdweb";

export default function ChainSelector({
  selectedChainId,
  handleNetworkChange,
  title = "From",
  isInMiniApp,
}: {
  selectedChainId: number;
  isInMiniApp: boolean;
  handleNetworkChange: (chain: Chain) => void;
  title?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-chicago text-xs font-normal text-9black">
        {title}{" "}
        <span className="underline">
          {
            Object.values(
              isInMiniApp
                ? {
                    superposition: config.chains.superposition,
                    ...config.farcasterChains,
                  }
                : config.chains,
            ).find((chain) => chain.id === selectedChainId)?.name
          }
        </span>
      </span>
      <div className="flex items-center gap-1">
        {Object.values(
          isInMiniApp
            ? {
                superposition: config.chains.superposition,
                ...config.farcasterChains,
              }
            : config.chains,
        ).map((chain) => (
          <div
            key={chain.id}
            onClick={() => handleNetworkChange(chain)}
            title={chain.name}
            className="cursor-pointer"
          >
            <Image
              alt={chain.name ?? ""}
              src={chain.icon}
              className={combineClass(
                chain.id === selectedChainId
                  ? "border-2 border-9black"
                  : "border border-9black/50 grayscale",
                "size-8",
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
