import { currentChain } from "@/config/chains";
import { combineClass } from "@/utils/combineClass";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import LoadingIndicator from "./loadingIndicator";
import { UseFormSetValue } from "react-hook-form";
const chainNames: Record<number, string> = {
  1: "Ethereum Mainnet",
  10: "Optimism",
  56: "Binance Smart Chain",
  100: "Gnosis",
  130: "Chain Name",
  137: "Polygon",
  146: "Chain Name",
  288: "Boba Network",
  324: "zkSync Era",
  480: "Chain Name",
  1101: "Polygon zkEVM",
  1135: "Chain Name",
  1329: "Chain Name",
  1868: "Chain Name",
  1923: "Chain Name",
  2741: "Chain Name",
  33139: "Chain Name",
  34443: "Mode",
  42161: "Arbitrum One",
  43114: "Avalanche C-Chain",
  534352: "Scroll",
  57073: "Chain Name",
  59144: "Linea",
  60808: "Chain Name",
  80094: "Chain Name",
  81457: "Blast",
  8453: "Base",
  167000: "Chain Name",
  21000000: "Chain Name",
  1151111081099710: "Chain Name",
};
function Token({
  selectedChainId,
  setValue,
  close,
}: {
  selectedChainId?: number;
  setValue: UseFormSetValue<{
    fusdc: number;
    toChain: number;
    toToken: string;
    fromChain: number;
    fromToken: string;
    fromTokenName?: string | undefined;
    fromChainName?: string | undefined;
  }>;
  close: () => void;
}) {
  const { data: tokens, isLoading } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokens", selectedChainId],
    queryFn: async () => {
      if (!selectedChainId) return [];
      const url = `https://li.quest/v1/tokens?chains=${selectedChainId}`;
      const options = {
        method: "GET",
        headers: { accept: "application/json" },
      };
      const res = await fetch(url, options);
      const data = (await res.json()) as {
        tokens: {
          [selectedChainId]: {
            chainId: number;
            address: string;
            symbol: string;
            name: string;
            decimals: number;
            priceUSD: string;
            coinKey: string;
            logoURI: string;
          }[];
        };
      };
      const items = data.tokens[selectedChainId];
      return items;
    },
  });
  function setToken(address: string, name: string) {
    setValue("fromToken", address);
    setValue("fromTokenName", name);
    setValue("fromChain", selectedChainId ?? 1);
    setValue("fromChainName", chainNames[selectedChainId ?? 1]);
    close();
  }
  if (isLoading)
    return (
      <div className="flex h-20 items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  return (
    <ul className="flex flex-col gap-1">
      {tokens?.map((t) => (
        <li
          key={t.address}
          onClick={() => setToken(t.address, `${t.name} (${t.symbol})`)}
          className="w-full cursor-pointer py-1 hover:bg-9black/10"
        >
          {t.name}({t.symbol})
        </li>
      ))}
    </ul>
  );
}

export default function Zapper({
  setValue,
  close,
}: {
  setValue: UseFormSetValue<{
    fusdc: number;
    toChain: number;
    toToken: string;
    fromChain: number;
    fromToken: string;
    fromTokenName?: string | undefined;
    fromChainName?: string | undefined;
  }>;
  close: () => void;
}) {
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>();
  const {
    data: chains,
    isSuccess,
    isLoading,
  } = useQuery({
    queryKey: ["chains"],
    queryFn: async () => {
      const url = "https://li.quest/v1/tools?chains=55244";
      const options = {
        method: "GET",
        headers: { accept: "application/json" },
      };
      const res = await fetch(url, options);
      const data = (await res.json()) as {
        bridges: {
          key: string;
          supportedChains: { fromChainId: number; toChainId: number }[];
        }[];
      };
      const chains = data?.bridges.find(
        (i) => i.key === "relay",
      )?.supportedChains;
      return chains
        ?.filter((i) => i.toChainId === currentChain.id)
        .map((i) => i.fromChainId)
        .sort((a, b) => a - b);
    },
  });
  useEffect(() => {
    if (isSuccess && chains) {
      setSelectedNetworkId(chains[0]);
      setValue("fromChain", chains[0]);
      setValue("fromChainName", chainNames[chains[0]]);
    }
  }, [chains, isSuccess, setValue]);

  if (isLoading)
    return (
      <div className="flex h-20 items-center justify-center">
        <LoadingIndicator />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-2">
        {chains?.map((id) => (
          <li
            key={id + "chain_id"}
            onClick={() => {
              setSelectedNetworkId(id);
              setValue("fromChain", id);
              setValue("fromChainName", chainNames[id]);
            }}
            className={combineClass(
              selectedNetworkId === id && "text-red-500 underline",
              "cursor-pointer hover:underline",
            )}
          >
            {chainNames[id ?? 1]}
          </li>
        ))}
      </ul>
      <Token
        close={close}
        selectedChainId={selectedNetworkId}
        setValue={setValue}
      />
    </div>
  );
}
