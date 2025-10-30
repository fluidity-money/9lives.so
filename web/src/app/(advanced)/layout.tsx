import DegenModeFloatingButton from "@/components/degenMode/degenModeFloatingButton";
import EmailSuggester from "@/components/emailSuggester";
import Changelog from "@/components/changelog";
import DegenModeWrapper from "@/components/degenMode/degenModeWrapper";
import Footer from "@/components/footer";
import Header from "@/components/header";
import {
  getCachedBuysAndSells,
  getCachedCreations,
} from "@/serverData/getActions";
import { BuyAndSellResponse, CreationResponse } from "@/types";
import AdvancedModeProvider from "@/providers/advancedModeProvider";

export default async function AdvancedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [degenCreations, degenBuysAndSells] = await Promise.all([
    getCachedCreations() as Promise<CreationResponse>,
    getCachedBuysAndSells() as Promise<BuyAndSellResponse>,
  ]);
  return (
    <>
      <AdvancedModeProvider
        initialData={{ degenCreations, degenBuysAndSells }}
      />
      <Header />
      <main className="flex flex-1 gap-2">
        <div className="flex-1 p-4">{children}</div>
        <DegenModeWrapper />
      </main>
      <Footer />
      <Changelog />
      <EmailSuggester />
      <DegenModeFloatingButton />
    </>
  );
}
