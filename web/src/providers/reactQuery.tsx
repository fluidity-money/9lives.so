import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { graphql } from "@/gql";
import request from "graphql-request";
import appConfig from "@/config";
export const CampaignList = graphql(`
  query CampaignList {
    campaigns {
      name
      identifier
      description
      oracle
      poolAddress
      outcomes {
        identifier
        name
        share {
          address
        }
      }
    }
  }
`);

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
      queryFn: () => request(appConfig.NEXT_PUBLIC_GRAPHQL_URL, CampaignList),
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
