"use client";
import React, { useEffect } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import { PricePoint, PricePointResponse } from "@/types";

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_WS_URL,
  connectionParams: {},
});

const subPricesForDuration = `
subscription($symbol: String!, $starting: timestamp!) {
  oracles_ninelives_prices_1(order_by: {created_by: asc}, where: {created_by: {_gte: $starting}, base: {_eq: $symbol}}) {
    id
    amount
    created_by
  }
}
`;
export default function ChartPriceProvider({
  starting,
  symbol,
  children,
}: {
  starting: number;
  symbol: string;
  children: Readonly<React.ReactNode>;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubPrices = wsClient.subscribe<{
      oracles_ninelives_prices_1: PricePointResponse[];
    }>(
      {
        query: subPricesForDuration,
        variables: {
          symbol: symbol.toUpperCase(),
          starting: new Date().toISOString(),
        },
      },
      {
        next: async ({ data }) => {
          const nextData = data?.oracles_ninelives_prices_1;
          if (nextData && nextData.length > 0) {
            queryClient.setQueryData<PricePoint[]>(
              ["assetPrice", symbol, starting],
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
            symbol,
            starting,
            error,
          );
        },
        complete: () => {
          console.log("WebSocket chart subscription closed.", symbol, starting);
        },
      },
    );
    return () => {
      unsubPrices();
    };
  }, [queryClient, symbol, starting]);

  return children;
}
