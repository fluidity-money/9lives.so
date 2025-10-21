import DegenModeFloatingButton from "@/components/degenMode/degenModeFloatingButton";
import EmailSuggester from "@/components/emailSuggester";
import Changelog from "@/components/changelog";
import DegenModeWrapper from "@/components/degenMode/degenModeWrapper";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Providers from "@/providers";
import {
  getCachedBuysAndSells,
  getCachedCreations,
} from "@/serverData/getActions";
import { getCachedCampaigns } from "@/serverData/getCampaigns";
import { BuyAndSellResponse, CreationResponse } from "@/types";

export default async function AdvancedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [campaigns, degenCreations, degenBuysAndSells] = await Promise.all([
    getCachedCampaigns(),
    getCachedCreations() as Promise<CreationResponse>,
    getCachedBuysAndSells() as Promise<BuyAndSellResponse>,
  ]);
  return (
    <Providers
      initialData={{
        campaigns,
        degenCreations,
        degenBuysAndSells,
      }}
    >
      <Header />
      <main className="flex flex-1 gap-2">
        <div className="flex-1 p-4">{children}</div>
        <DegenModeWrapper />
      </main>
      <Footer />
      <Changelog />
      <EmailSuggester />
      <DegenModeFloatingButton />
    </Providers>
  );
}
