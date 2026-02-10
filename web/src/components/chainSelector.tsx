import config from "@/config";
import { combineClass } from "@/utils/combineClass";
import Image from "next/image";
import { Chain } from "@/types";

interface ChainSelectorProps {
  selectedChainId: number;
  handleNetworkChange: (chain: Chain) => void;
  title?: string;
  isInMiniApp: boolean;
  exclude?: (keyof typeof config.chains)[];
}

export default function ChainSelector({
  selectedChainId,
  handleNetworkChange,
  title = "From",
  exclude,
}: ChainSelectorProps): React.ReactElement {
  const chains = JSON.parse(JSON.stringify(config.chains)) as Record<
    string,
    Chain
  >;
  if (exclude && exclude.length > 0) {
    for (const key of exclude) {
      delete chains[key];
    }
  }
  const chainList = Object.values(chains);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-chicago text-xs font-normal text-9black">
        {title}{" "}
        <span className="underline">
          {chainList.find((chain) => chain.id === selectedChainId)?.name}
        </span>
      </span>
      <div className="flex items-center gap-1">
        {chainList.map((chain) => (
          <div
            key={chain.id}
            onClick={() => handleNetworkChange(chain)}
            title={chain.name}
            className="cursor-pointer"
          >
            {chain.icon ? (
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
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
