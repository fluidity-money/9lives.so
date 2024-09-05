import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { combineClass } from "@/utils/combineClass";
import GoogleAnalytics from "@/components/googleAnalytics";
import dynamic from "next/dynamic";
const CookieBanner = dynamic(() => import("@/components/cookieBanner"), {
  ssr: false,
});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "9Lives.so",
  description: "The most capital efficient prediction market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={combineClass([
          inter.className,
          "flex min-h-screen flex-col",
        ])}
      >
        <Providers>
          <Header />
          <main className="flex flex-1 p-4">{children}</main>
          <Footer />
          <CookieBanner />
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
