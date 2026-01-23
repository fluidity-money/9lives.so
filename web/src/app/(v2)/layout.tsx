import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../globals.css";
import appConfig from "@/config";
import Providers from "@/providers";
import { headers } from "next/headers";
import GoogleAnalytics from "@/components/googleAnalytics";
import CustomToaster from "@/components/v2/customToaster";
import CookieBanner from "@/components/v2/cookie";
import Header from "@/components/v2/header";
import Footer from "@/components/v2/footer";
import BetaTesterInvitation from "@/components/v2/betatester";

export const metadata: Metadata = {
  ...appConfig.metadata,
  other: {
    "fc:miniapp": JSON.stringify({
      version: appConfig.frame.version,
      imageUrl: appConfig.frame.imageUrl,
      button: appConfig.frame.button,
    }),
  },
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");
  return (
    <html lang="en" className={dmSans.className}>
      <body className="flex min-h-screen flex-col bg-2white">
        <Providers cookies={cookies}>
          <Header />
          <main className="mx-auto flex w-full max-w-[600px] flex-1 justify-center">
            <div className="flex-1 p-4">{children}</div>
          </main>
          <Footer />
          <BetaTesterInvitation />
        </Providers>
        <CookieBanner />
        <CustomToaster />
      </body>
      <GoogleAnalytics />
    </html>
  );
}
