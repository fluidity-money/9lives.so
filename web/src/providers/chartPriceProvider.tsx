"use client";
import React, { useEffect } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import { PricePoint, RawAssetPrices } from "@/types";

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_WS_URL,
  connectionParams: {},
});

const subPricesForDuration = `
subscription($symbol: String!, $starting: timestamp!, $ending: timestamp!) {
  oracles_ninelives_prices_1(order_by: {created_by: desc}, where: {created_by: {_gte: $starting, _lte: $ending}, base: {_eq: $symbol}}, limit: 2) {
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
  symbol: string;
  children: Readonly<React.ReactNode>;
}) {
  const queryClient = useQueryClient();
  const _symbol = symbol.toLowerCase();
  useEffect(() => {
    const unsubPrices = wsClient.subscribe<RawAssetPrices>(
      {
        query: subPricesForDuration,
        variables: {
          symbol: _symbol.toUpperCase(),
          starting: new Date().toISOString(),
          ending: new Date(ending).toISOString(),
        },
      },
      {
        next: async ({ data }) => {
          const nextData = data?.oracles_ninelives_prices_1;
          if (nextData && nextData.length > 0) {
            queryClient.setQueryData<PricePoint[]>(
              ["assetPrices", _symbol, starting, ending],
              (previousData) => {
                const onlyNewItems = nextData
                  .filter(
                    (i) => !previousData?.find((pi) => pi.id === i.id)?.id,
                  )
                  .map((i) => ({
                    id: i.id,
                    price: i.amount,
                    timestamp:
                      new Date(i.created_by).getTime() -
                      new Date().getTimezoneOffset() * 60 * 1000,
                  }));
                if (previousData) {
                  return [...previousData, ...onlyNewItems];
                } else {
                  return onlyNewItems;
                }
              },
            );
          }
        },
        error: (error) => {
          console.error(
            "WebSocket error for chart token",
            _symbol,
            starting,
            ending,
            error,
          );
        },
        complete: () => {
          console.log(
            "WebSocket chart subscription closed.",
            _symbol,
            starting,
            ending,
          );
        },
      },
    );
    return () => {
      unsubPrices();
    };
  }, [queryClient, _symbol, starting, ending]);

  return children;
}
