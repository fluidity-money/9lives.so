import DetailWrapper from "@/components/detail/detailWrapper";
import { getCampaigns } from "@/serverData/getCampaigns";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamicParams = true;
export const revalidate = 60;
export async function generateStaticParams() {
  const campaigns = await getCampaigns();
  return campaigns.map((campaign) => ({
    id: campaign.identifier,
  }));
}
type Params = Promise<{ id: string }>;
export default async function DetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const campaigns = await getCampaigns();
  const campaign = campaigns.find((campaign) => campaign.identifier === id)!;
  if (!campaign) notFound();
  return (
    <section className="flex h-full gap-4">
      <Suspense>
        <DetailWrapper initialData={campaign} />
      </Suspense>
    </section>
  );
}
