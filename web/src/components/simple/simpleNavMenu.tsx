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
      {config.simpleMarkets.map((m) => (
        <Link key={m} href={`/simple/campaign/${m}`}>
          <TabButton
            title={m.toUpperCase()}
            selected={id.toLowerCase() === m}
          />
        </Link>
      ))}
    </div>
  );
}
