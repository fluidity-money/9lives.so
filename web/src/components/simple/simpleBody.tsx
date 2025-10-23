"use client";

import AssetPriceChart from "../assetPriceChart";
import {
  requestAssetPrice,
  requestSimpleMarket,
} from "../../providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";
import { PricePoint } from "@/types";
import SimpleSubHeader from "./simpleSubHeader";
import Button from "../themed/button";
import Link from "next/link";
import Modal from "../themed/modal";
import SimpleBuyDialog from "../simpleBuyDialog";
import { useState } from "react";

export default function SimpleBody({
  data,
  initialAssetPrices,
}: {
  data: Awaited<ReturnType<typeof requestSimpleMarket>> & {
    symbol: string;
    basePrice: number;
  };
  initialAssetPrices?: PricePoint[];
}) {
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const symbol = data.symbol.toLowerCase();
  const { data: assetPrices, isSuccess: assetsLoaded } = useQuery<PricePoint[]>(
    {
      queryKey: ["assetPrice", symbol, data.starting, data.ending],
      queryFn: async () => {
        const res = await requestAssetPrice(
          symbol,
          new Date(data.starting).toISOString(),
          new Date(data.ending).toISOString(),
        );
        if (res?.oracles_ninelives_prices_1) {
          return res?.oracles_ninelives_prices_1.map((i) => ({
            price: i.amount,
            id: i.id,
            timestamp:
              new Date(i.created_by).getTime() -
              new Date().getTimezoneOffset() * 60 * 1000,
          }));
        }
        return [];
      },
      initialData: initialAssetPrices,
    },
  );
  const [outcomeIdx, setOutcomeIdx] = useState(0);

  return (
    <>
      <div className="flex flex-col gap-2 rounded-[3px] border-[1.5px] border-9black bg-[#fafafa] px-2 py-1 text-center text-xs shadow-9liqCard md:px-4 md:py-3">
        <h4 className="font-chicago">
          Simple Mode: Get started predicting the future with hourly markets
        </h4>
        <h5>
          Once you&apos;re ready, create your own markets and trade using{" "}
          <Link href="/" className="underline">
            advanced mode
          </Link>
          .
        </h5>
      </div>
      <SimpleSubHeader
        ending={data.ending}
        basePrice={data.basePrice}
        latestPrice={assetPrices?.[assetPrices?.length - 1]?.price ?? 0}
      />
      <AssetPriceChart
        simple
        basePrice={data.basePrice}
        id={data.identifier}
        symbol={data.symbol}
        starting={data.starting}
        ending={data.ending}
        assetPrices={assetPrices}
        assetsLoaded={assetsLoaded}
      />
      <div className="flex flex-row items-center gap-1">
        <span className="font-chicago text-sm">%{+(0.2 * 100).toFixed(0)}</span>
        <div className="h-2 flex-1 bg-9red">
          <div className="h-2 bg-9green" style={{ width: `${0.2 * 100}%` }} />
        </div>
        <span className="font-chicago text-sm">%{+(0.8 * 100).toFixed(0)}</span>
      </div>
      <div className="sticky inset-x-0 bottom-0 flex items-center gap-2 bg-9layer pb-2 md:static md:bg-transparent md:p-0">
        <Button
          title="Up"
          intent={"yes"}
          size={"xlarge"}
          className={"flex-auto"}
          onClick={() => {
            setOutcomeIdx(0);
            setIsBuyDialogOpen(true);
          }}
        />
        <Button
          title="Down"
          intent={"no"}
          size={"xlarge"}
          className={"flex-auto"}
          onClick={() => {
            setOutcomeIdx(1);
            setIsBuyDialogOpen(true);
          }}
        />
      </div>
      <Modal
        isOpen={isBuyDialogOpen}
        setIsOpen={setIsBuyDialogOpen}
        title="Predict Price"
        boxContainerClass="md:max-w-screen max-w-[400px]"
      >
        <SimpleBuyDialog
          data={data}
          outcomeIdx={outcomeIdx}
          setOutcomeIdx={setOutcomeIdx}
        />
      </Modal>
    </>
  );
}
