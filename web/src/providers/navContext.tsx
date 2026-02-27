"use client";
import { SimpleMarketKey, SimpleMarketPeriod } from "@/types";
import { createContext, Dispatch, useState } from "react";
interface NavContextProps {
  symbol: SimpleMarketKey;
  period: SimpleMarketPeriod;
  setSymbol: Dispatch<SimpleMarketKey>;
  setPeriod: Dispatch<SimpleMarketPeriod>;
}
export const NavContext = createContext<NavContextProps>({
  symbol: "btc",
  period: "15mins",
  setSymbol: () => {},
  setPeriod: () => {},
});

export default function NavContextProvider({
  initialSymbol,
  initialPeriod,
  children,
}: {
  initialSymbol: SimpleMarketKey;
  initialPeriod: SimpleMarketPeriod;
  children: React.ReactNode;
}) {
  const [symbol, setSymbol] = useState<SimpleMarketKey>(initialSymbol);
  const [period, setPeriod] = useState<SimpleMarketPeriod>(initialPeriod);

  return (
    <NavContext.Provider value={{ symbol, period, setSymbol, setPeriod }}>
      {children}
    </NavContext.Provider>
  );
}
