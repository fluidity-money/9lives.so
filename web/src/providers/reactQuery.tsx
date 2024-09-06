import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { graphql } from "@/gql";
import request from "graphql-request";

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
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");

  const [queryClient] = useState(() => {
    // eslint-disable-next-line @tanstack/query/stable-query-client
    const client = new QueryClient();

    client.setQueryDefaults(["features"], {
      queryFn: () => fetch("https://features.9lives.so/features.json"),
    });

    client.setQueryDefaults(["campaigns"], {
      queryFn: () => request("https://testnet-graph.9lives.so", CampaignList),
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
