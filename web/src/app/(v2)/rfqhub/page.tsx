import RfqhubPrototype from "@/components/rfqhub/rfqhubPrototype";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick BTC prediction | 9lives",
  description: "Build a short-duration BTC price prediction with Rfqhub.",
};

export default function RfqhubPage() {
  return <RfqhubPrototype />;
}
