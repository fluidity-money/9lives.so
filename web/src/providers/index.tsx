"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import { Campaign } from "@/types";

export default function Providers({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: Campaign[];
}) {
  return (
    <ThirdwebProvider>
      <ReactQueryProvider initialData={initialData}>
        <ContextInjector />
        {children}
      </ReactQueryProvider>
    </ThirdwebProvider>
  );
}
