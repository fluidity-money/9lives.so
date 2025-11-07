"use client";
import config from "@/config";
import TabButton from "../tabButton";
import { useParams } from "next/navigation";
import Link from "next/link";
type Params = { id: string };
export default function SimpleNavMenu() {
  const { id } = useParams<Params>();
  return (
    <div className="flex items-center border-b border-b-9black">
      {Object.values(config.simpleMarkets).map((m) => (
        <Link key={m.slug} href={`/simple/campaign/${m.slug}`}>
          <TabButton
            title={m.tabTitle}
            selected={id.toLowerCase() === m.slug}
          />
        </Link>
      ))}
    </div>
  );
}
