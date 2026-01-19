import EmailSuggester from "@/components/emailSuggester";
import Changelog from "@/components/changelog";
import Footer from "@/components/footer";
import Header from "@/components/header";

export default async function AdvancedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex flex-1 justify-center">
        <div className="flex-1 p-4 md:max-w-screen-xl">{children}</div>
      </main>
      <Footer />
      <Changelog />
      <EmailSuggester />
    </>
  );
}
