import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import appConfig from "@/config";
import {
  PricePoint,
  SimpleCampaignDetail,
  SimpleMarketKey,
  SimpleMarketPeriod,
} from "@/types";
import getAndFormatAssetPrices from "@/utils/getAndFormatAssetPrices";
import { requestSimpleMarket } from "./graphqlClient";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
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
    type AssetPriceKey = [string, SimpleMarketKey, number, number];
    client.setQueryDefaults<PricePoint[]>(["assetPrices"], {
      queryFn: async ({ queryKey, pageParam }) => {
        const [, symbol, starting, ending] = queryKey as AssetPriceKey;
        return await getAndFormatAssetPrices({
          symbol,
          starting,
          ending,
          page: pageParam as number,
        });
      },
    });

    client.setQueryDefaults<SimpleCampaignDetail>(["simpleCampaign"], {
      queryFn: async ({ queryKey }) => {
        const [, symbol, period] = queryKey as [
          string,
          SimpleMarketKey,
          SimpleMarketPeriod,
        ];
        const data = await requestSimpleMarket(symbol, period);
        return formatSimpleCampaignDetail(data);
      },
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
