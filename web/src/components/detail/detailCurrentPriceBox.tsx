"use client";
import { HeaderBox } from "./detailHeaderBox";
import { useQuery } from "@tanstack/react-query";
import { requestAssetPrice } from "@/providers/graphqlClient";

export default function DetailCurrentPriceBox({
  symbol,
  starting,
  ending,
}: {
  symbol: string;
  ending: number;
  starting: number;
}) {
  const _symbol = symbol.toLowerCase();
  const { data, isSuccess } = useQuery({
    queryKey: ["assetPrice", _symbol, starting, ending],
    queryFn: async () => {
      const res = await requestAssetPrice(
        _symbol,
        new Date(starting).toISOString(),
        new Date(ending).toISOString(),
      );
      if (res?.oracles_ninelives_prices_1) {
        return res.oracles_ninelives_prices_1[
          res.oracles_ninelives_prices_1.length - 1
        ].amount;
      }
    },
  });

  if (!isSuccess) return null;

  return <HeaderBox title={"Current Price"} value={`$${data}`} />;
}
