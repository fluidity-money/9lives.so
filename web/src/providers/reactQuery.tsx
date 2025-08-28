import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import appConfig from "@/config";
import {
  ActionFromBuysAndSells,
  ActionFromCreation,
  BuyAndSellResponse,
  Campaign,
  CreationResponse,
} from "@/types";
import { getTotalUserCount } from "@/serverData/getTotalUserCount";

export default function ReactQueryProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: {
    campaigns: Campaign[];
    totalUserCount?: number;
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

    client.setQueryData(
      ["campaigns", undefined, "trending", "", undefined],
      () => ({
        pages: [initialData.campaigns],
        pageParams: [0],
      }),
    );

    client.setQueryDefaults(["totalUserCount"], {
      queryFn: getTotalUserCount,
      initialData: initialData.totalUserCount,
    });

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
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
