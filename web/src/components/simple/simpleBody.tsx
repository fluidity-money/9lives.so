"use client";

import AssetPriceChart from "../assetPriceChart";
import { useQuery } from "@tanstack/react-query";
import { PricePoint, SimpleCampaignDetail } from "@/types";
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
  data: SimpleCampaignDetail;
  initialAssetPrices?: PricePoint[];
}) {
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const symbol = data.priceMetadata.baseAsset.toLowerCase();
  const basePrice = Number(data.priceMetadata.priceTargetForUp);
  const { data: assetPrices, isSuccess: assetsLoaded } = useQuery<PricePoint[]>(
    {
      queryKey: ["assetPrices", symbol, data.starting, data.ending],
      initialData: initialAssetPrices,
    },
  );
  const isEnded = Date.now() > data.ending;
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
        basePrice={basePrice}
        latestPrice={assetPrices?.[assetPrices?.length - 1]?.price ?? 0}
      />
      <AssetPriceChart
        simple
        basePrice={basePrice}
        id={data.identifier}
        symbol={symbol}
        starting={data.starting}
        ending={data.ending}
        assetPrices={assetPrices}
        assetsLoaded={assetsLoaded}
      />
      {data.investmentAmounts.length > 1 ? (
        <div className="flex flex-row items-center gap-1">
          <span className="font-chicago text-sm">
            %{+(0.2 * 100).toFixed(0)}
          </span>
          <div className="h-2 flex-1 bg-9red">
            <div className="h-2 bg-9green" style={{ width: `${0.2 * 100}%` }} />
          </div>
          <span className="font-chicago text-sm">
            %{+(0.8 * 100).toFixed(0)}
          </span>
        </div>
      ) : null}
      <div className="sticky inset-x-0 bottom-0 flex items-center gap-2 bg-9layer pb-2 md:static md:bg-transparent md:p-0">
        {isEnded ? (
          <p className="mx-auto font-chicago text-xs">
            This campaign is ended, go to live campaign
          </p>
        ) : (
          <>
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
          </>
        )}
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
