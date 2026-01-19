import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { combineClass } from "@/utils/combineClass";
import GoogleAnalytics from "@/components/googleAnalytics";
import appConfig from "@/config";
import CustomToaster from "@/components/customToaster";
import CookieBanner from "@/components/cookieBanner";
import Providers from "@/providers";
import { headers } from "next/headers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BetaTesterInvitation from "@/components/betaTesterInvitation";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");
  return (
    <html
      lang="en"
      // className={combineClass([
      //   chicago.variable,
      //   geneva.variable,
      //   arial.className,
      //   arial.variable,
      // ])}
    >
      <body className="flex min-h-screen flex-col bg-9layer">
        <Providers cookies={cookies}>
          <Header simple />
          <main className="mx-auto flex max-w-[600px] flex-1 justify-center">
            <div className="flex-1 p-4">{children}</div>
          </main>
          <Footer simple />
          <BetaTesterInvitation />
        </Providers>
        <CookieBanner />
        <CustomToaster />
      </body>
      <GoogleAnalytics />
    </html>
  );
}
