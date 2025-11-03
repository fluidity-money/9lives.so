import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { combineClass } from "@/utils/combineClass";
import GoogleAnalytics from "@/components/googleAnalytics";
import appConfig from "@/config";
import CustomToaster from "@/components/customToaster";
import CookieBanner from "@/components/cookieBanner";
import ThemeScript from "@/components/theme/themeScript";
import Providers from "@/providers";

const chicago = localFont({
  src: [
    {
      path: "../../public/fonts/chicago-12.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-chicago",
});
const geneva = localFont({
  src: [
    {
      path: "../../public/fonts/geneva-9.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-geneva",
});
const arial = localFont({
  src: [
    {
      path: "../../public/fonts/arial.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/arial-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-arial",
});
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
  return (
    <html
      lang="en"
      className={combineClass([
        chicago.variable,
        geneva.variable,
        arial.className,
        arial.variable,
      ])}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-9layer text-9black transition-colors duration-300 dark:bg-9black dark:text-9gray">
        <ThemeScript />
        <Providers>{children}</Providers>
        <CookieBanner />
        <CustomToaster />
      </body>
      <GoogleAnalytics />
    </html>
  );
}
