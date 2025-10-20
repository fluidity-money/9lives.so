import Footer from "@/components/footer";
import Header from "@/components/header";

export default function SimpleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header simple />
      <main className="mx-auto flex max-w-[600px] flex-1 gap-2">
        <div className="flex-1 p-4">{children}</div>
      </main>
      <Footer simple />
    </>
  );
}
