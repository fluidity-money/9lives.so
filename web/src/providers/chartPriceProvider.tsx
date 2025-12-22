"use client";
import React, { useEffect } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import { PricePoint, RawAssetPrices, SimpleMarketKey } from "@/types";
import { formatPricePoint } from "@/utils/format/formatAssetPrice";

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_WS_URL,
  connectionParams: {},
});

const subPricesForDuration = `
subscription ($symbol: String!, $starting: timestamp!, $ending: timestamp!) {
  oracles_ninelives_prices_2(
    order_by: { created_by: desc }
    where: {
      created_by: { _gte: $starting, _lte: $ending }
      base: { _eq: $symbol }
    }
    limit: 5
  ) {
    id
    amount
    created_by
  }
}
`;
export default function ChartPriceProvider({
  starting,
  ending,
  symbol,
  children,
}: {
  starting: number;
  ending: number;
  symbol: SimpleMarketKey;
  children: Readonly<React.ReactNode>;
}) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsubPrices = wsClient.subscribe<RawAssetPrices>(
      {
        query: subPricesForDuration,
        variables: {
          symbol: symbol.toUpperCase(),
          starting: new Date(starting).toISOString(),
          ending: new Date(ending).toISOString(),
        },
      },
      {
        next: async ({ data }) => {
          const nextData = data?.oracles_ninelives_prices_2;
          if (nextData && nextData.length > 0) {
            queryClient.setQueryData<
              { pages: PricePoint[][]; pageParams: number[] } | undefined
            >(["assetPrices", symbol, starting, ending], (previousData) => {
              const newPoint = nextData.map((i) =>
                formatPricePoint(i, symbol),
              )[0];
              if (previousData) {
                if (
                  previousData.pages[previousData.pages.length - 1].length ===
                  config.hasuraMaxQueryItem
                ) {
                  return {
                    pages: [...previousData.pages, [newPoint]],
                    pageParams: [
                      ...previousData.pageParams,
                      previousData.pageParams[
                        previousData.pageParams.length - 1
                      ] + 1,
                    ],
                  };
                } else {
                  return {
                    pages: previousData.pages.map((p, idx) => {
                      if (idx === previousData.pages.length - 1) {
                        return [...p, newPoint];
                      } else return p;
                    }),
                    pageParams: previousData.pageParams,
                  };
                }
              } else {
                return { pages: [[newPoint]], pageParams: [0] };
              }
            });
          }
        },
        error: (error) => {
          console.error(
            "WebSocket error for chart token",
            symbol,
            starting,
            ending,
            error,
          );
        },
        complete: () => {
          console.log(
            "WebSocket chart subscription closed.",
            symbol,
            starting,
            ending,
          );
        },
      },
    );
    return () => {
      unsubPrices();
    };
  }, [queryClient, symbol, starting, ending]);

  return children;
}
