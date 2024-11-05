import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { requestCampaignList, requestTotalUserCount } from "./graphqlClient";
import appConfig from "@/config";
import { Campaign } from "@/types";

export default function ReactQueryProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: { campaigns: Campaign[]; totalUserCount: number };
}) {
  const [queryClient] = useState(() => {
    // eslint-disable-next-line @tanstack/query/stable-query-client
    const client = new QueryClient();

    client.setQueryDefaults(["features"], {
      queryFn: () => fetch(appConfig.NEXT_PUBLIC_FEATURES_URL),
    });

    client.setQueryDefaults(["campaigns"], {
      queryFn: async () => {
        const res = await requestCampaignList;
        return res.campaigns;
      },
      initialData: initialData.campaigns,
    });

    client.setQueryDefaults(["totalUserCount"], {
      queryFn: async () => {
        const res = await requestTotalUserCount;
        return res.productUserCount;
      },
      initialData: initialData.totalUserCount,
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
