"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </ThirdwebProvider>
  );
}
