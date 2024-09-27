"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <ReactQueryProvider>
        <ContextInjector />
        {children}
      </ReactQueryProvider>
    </ThirdwebProvider>
  );
}
