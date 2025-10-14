import DegenModeWrapper from "@/components/degenMode/degenModeWrapper";
import Footer from "@/components/footer";
import Header from "@/components/header";

export default function AdvancedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex flex-1 gap-2">
        <div className="flex-1 p-4">{children}</div>
        <DegenModeWrapper />
      </main>
      <Footer />
    </>
  );
}
