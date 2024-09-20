import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { requestCampaignList } from "./graphqlClient";
import appConfig from "@/config";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => {
    // eslint-disable-next-line @tanstack/query/stable-query-client
    const client = new QueryClient();

    client.setQueryDefaults(["features"], {
      queryFn: () => fetch(appConfig.NEXT_PUBLIC_FEATURES_URL),
    });

    client.setQueryDefaults(["campaigns"], {
      queryFn: () => requestCampaignList,
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
