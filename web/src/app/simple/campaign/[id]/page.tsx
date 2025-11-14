import config from "@/config";
import { requestSimpleMarket } from "@/providers/graphqlClient";
import Image from "next/image";
import { notFound } from "next/navigation";
import SimpleNavMenu from "@/components/simple/simpleNavMenu";
import SimpleBody from "@/components/simple/simpleBody";
import { Suspense } from "react";
import SimpleHeader from "@/components/simple/simpleHeader";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ cid: string }>;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  return Object.values(config.simpleMarkets).map((m) => ({
    id: m.slug,
  }));
}
export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestSimpleMarket(id);
  return {
    title: response?.name ?? "Predict on 9lives.so",
    description: response?.name ?? "Predict token prices in hourly markets",
    other: {
      "fc:miniapp": JSON.stringify({
        version: config.frame.version,
        imageUrl: `${config.metadata.metadataBase.origin}/simple/campaign/${id}/farcaster-image`,
        button: config.frame.button,
      }),
    },
  };
}
function isSimpleMarketKey(k: string): k is keyof typeof config.simpleMarkets {
  return k in config.simpleMarkets;
}
export default async function SimpleDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { cid } = await searchParams;

  if (!isSimpleMarketKey(id)) notFound();

  return (
    <div className="flex flex-col gap-4">
      <SimpleNavMenu />
      <div className="flex items-center gap-2">
        <Image
          src={config.simpleMarkets[id].logo}
          width={60}
          height={60}
          alt={id}
        />
        <Suspense
          fallback={
            <div>
              <h1 className="font-chicago text-xl md:text-2xl">
                {config.simpleMarkets[id].title} above $...... on{" "}
                {new Date().toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  hourCycle: "h23",
                  minute: "2-digit",
                  timeZone: "UTC",
                })}{" "}
                UTC
              </h1>
              <span className="font-geneva text-xs uppercase text-[#808080]">
                {new Date().toLocaleString("default", {
                  hour: "numeric",
                  timeZone: "UTC",
                })}{" "}
                -{" "}
                {new Date(Date.now() + 1000 * 60 * 60).toLocaleString(
                  "default",
                  {
                    hour: "numeric",
                    timeZone: "UTC",
                  },
                )}
                {" UTC"}
              </span>
            </div>
          }
        >
          <SimpleHeader id={id} cid={cid} />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="skeleton h-[66px] flex-1" />
              <div className="skeleton h-[66px] flex-1" />
            </div>
            <div className="skeleton h-[300px] w-[568px]" />
            <div className="skeleton h-[58px] w-full" />
            <div className="skeleton h-5 w-full" />
          </div>
        }
      >
        <SimpleBody id={id} cid={cid} />
      </Suspense>
    </div>
  );
}
