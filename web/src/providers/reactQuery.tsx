import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import appConfig from "@/config";
import {
  ActionFromBuysAndSells,
  ActionFromCreation,
  BuyAndSellResponse,
  CreationResponse,
} from "@/types";
import { requestAssetPrice } from "./graphqlClient";

export default function ReactQueryProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: {
    degenBuysAndSells: BuyAndSellResponse;
    degenCreations: CreationResponse;
  };
}) {
  const [queryClient] = useState(() => {
    // eslint-disable-next-line @tanstack/query/stable-query-client
    const client = new QueryClient();

    client.setQueryDefaults(["features"], {
      queryFn: async () => {
        const res = await fetch(appConfig.NEXT_PUBLIC_FEATURES_URL);
        return await res.json();
      },
    });

    if (initialData) {
      const buyAndSellActions =
        initialData.degenBuysAndSells.ninelives_buys_and_sells_1.map(
          (e) => new ActionFromBuysAndSells(e),
        );
      const creationActions =
        initialData.degenCreations.ninelives_campaigns_1.map(
          (c) => new ActionFromCreation(c),
        );
      client.setQueryDefaults(["actions"], {
        initialData: [...creationActions, ...buyAndSellActions].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
      });
    }

    client.setQueryDefaults(["assetPrices"], {
      queryFn: async ({ queryKey }) => {
        const [, symbol, starting, ending] = queryKey as [
          string,
          string,
          number,
          number,
        ];
        if (symbol) {
          const res = await requestAssetPrice(
            symbol,
            new Date(starting * 1000).toISOString(),
            new Date(ending * 1000).toISOString(),
          );
          if (res?.oracles_ninelives_prices_1) {
            return res.oracles_ninelives_prices_1.map((i) => ({
              price: i.amount,
              id: i.id,
              timestamp:
                new Date(i.created_by).getTime() -
                new Date().getTimezoneOffset() * 60 * 1000,
            }));
          }
        }
        return [];
      },
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
