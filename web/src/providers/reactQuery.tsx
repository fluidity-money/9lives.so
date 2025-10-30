import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import appConfig from "@/config";
import { PricePoint } from "@/types";
import getAndFormatAssetPrices from "@/utils/getAndFormatAssetPrices";

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

    client.setQueryDefaults<PricePoint[]>(["assetPrices"], {
      queryFn: async ({ queryKey }) => {
        const [, symbol, starting, ending] = queryKey as [
          string,
          string,
          number,
          number,
        ];
        return await getAndFormatAssetPrices({ symbol, starting, ending });
      },
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
