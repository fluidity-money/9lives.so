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
subscription($symbol: String!, $starting: String!) {
  oracles_ninelives_prices_1(order_by: {created_by: asc}, where: {created_by: {_gte: $starting} base: {_eq: $symbol}}) {
    id
    amount
    created_by
  }
}
`;
export default function ChartPriceProvider({
  id,
  symbol,
  starting,
  children,
}: {
  id: string;
  symbol: string;
  starting: number;
  children: Readonly<React.ReactNode>;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubPrices = wsClient.subscribe<PricePointResponse[]>(
      {
        query: subPricesForDuration,
        variables: {
          symbol: symbol.toUpperCase(),
          starting: new Date(starting).toISOString(),
        },
      },
      {
        next: async ({ data: nextData }) => {
          queryClient.setQueryData<PricePoint[]>(
            ["assetPrice", symbol, id],
            (previousData) => {
              if (nextData && nextData.length > 0)
                return nextData
                  .filter(
                    (i) => !previousData?.find((pi) => pi.id === i.id)?.id,
                  )
                  .map((i) => ({
                    id: i.id,
                    price: i.amount,
                    timestamp: new Date(i.created_by).getTime(),
                  }));
              return [];
            },
          );
        },
        error: (error) => {
          console.error("WebSocket error for chart token", symbol, id, error);
        },
        complete: () => {
          console.log("WebSocket chart subscription closed.", symbol, id);
        },
      },
    );
    return () => {
      unsubPrices();
    };
  }, [queryClient]);

  return children;
}
