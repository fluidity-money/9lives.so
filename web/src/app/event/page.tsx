"use client";
import DetailCall2Action from "@/components/detail/detailAction";
import DetailHeader from "@/components/detail/detailHeader";
import { CampaignListQuery } from "@/gql/graphql";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, Suspense } from "react";
import { SelectedBet } from "@/components/campaign/campaignItem";
import { useRouter, useSearchParams } from "next/navigation";
import DetailOutcomes from "@/components/detail/detailOutcomes";
function Details() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") as string;
  const router = useRouter();
  const { data: query, isLoading } = useQuery<CampaignListQuery>({
    queryKey: ["campaigns"],
  });
  const data = query?.campaigns.find((campaign) => campaign.identifier === id);
  const [selectedBet, setSelectedBet] = useState<SelectedBet>();

  useEffect(() => {
    if (!isLoading && !data) {
      router.replace("/404");
    }
  }, [data, router, isLoading]);

  useEffect(() => {
    if (data) {
      setSelectedBet({ ...data.outcomes[0], bet: true });
    }
  }, [data]);

  if (isLoading) return <section>...Loading</section>;

  return (
    <section className="flex h-full gap-4">
      <div className="flex flex-[2] flex-col gap-4">
        <DetailHeader data={data!} />
        <DetailOutcomes
          data={data!.outcomes}
          selectedBet={selectedBet}
          setSelectedBet={setSelectedBet}
        />
      </div>
      <div className="flex-1">
        {selectedBet && (
          <DetailCall2Action
            data={selectedBet}
            setSelectedBet={setSelectedBet}
          />
        )}
      </div>
    </section>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<section>...Loading</section>}>
      <Details />
    </Suspense>
  );
}
