"use client";

import AssetPriceChart from "../assetPriceChart";
import { useQuery } from "@tanstack/react-query";
import { Outcome, PricePoint, SimpleCampaignDetail } from "@/types";
import SimpleSubHeader from "./simpleSubHeader";
import Button from "../themed/button";
import Link from "next/link";
import Modal from "../themed/modal";
import SimpleBuyDialog from "../simpleBuyDialog";
import { useState } from "react";
import ActiveCampaignProvider from "@/providers/activeCampaignProvider";
import useSharePrices from "@/hooks/useSharePrices";
import usePositions from "@/hooks/usePositions";
import { useActiveAccount } from "thirdweb/react";
import SimplePositionRow from "./simplePositionRow";
import SimpleClaimButton from "./simpleClaimButton";
import RetroCard from "../cardRetro";

export default function SimpleBody({
  data,
  initialAssetPrices,
}: {
  data: SimpleCampaignDetail;
  initialAssetPrices?: PricePoint[];
}) {
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [isEnded, setIsEnded] = useState(Date.now() > data.ending);
  const symbol = data.priceMetadata.baseAsset.toLowerCase();
  const basePrice = Number(data.priceMetadata.priceTargetForUp);
  const account = useActiveAccount();
  const { data: assetPrices, isSuccess: assetsLoaded } = useQuery<PricePoint[]>(
    {
      queryKey: ["assetPrices", symbol, data.starting, data.ending],
      initialData: initialAssetPrices,
    },
  );
  const { data: sharePrices } = useSharePrices({
    tradingAddr: data.poolAddress as `0x${string}`,
    outcomeIds: data.outcomes.map((o) => o.identifier as `0x${string}`),
  });
  const [outcomeIdx, setOutcomeIdx] = useState(1);
  const { data: positions } = usePositions({
    tradingAddr: data.poolAddress,
    outcomes: data.outcomes,
    account,
    isDpm: false,
    isDppm: true,
  });
  const winnerOutcome = data.outcomes.find(
    (o) => o.identifier === data?.winner,
  ) as Outcome;
  const winnerPosition = positions?.find((p) => p.id === data?.winner);
  const isWinner = winnerOutcome && winnerPosition;
  return (
    <ActiveCampaignProvider
      previousData={data}
      symbol={symbol}
      setIsEnded={setIsEnded}
    >
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
        isEnded={isEnded}
        basePrice={basePrice}
        latestPrice={assetPrices?.[assetPrices?.length - 1]?.price ?? 0}
      />
      <div className="relative">
        {winnerOutcome ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-9layer/60 font-chicago">
            <div className="mb-32">
              <RetroCard position="middle" showClose={false} title="Winner">
                {" "}
                <span className="text-center">
                  {winnerOutcome.name === "Up"
                    ? "Price Went Up"
                    : "Price Went Down"}
                </span>
              </RetroCard>
            </div>
          </div>
        ) : null}
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
      </div>
      <div className="sticky inset-x-0 bottom-0 z-20 flex items-center gap-2 bg-9layer pb-2 md:static md:bg-transparent md:p-0">
        {isWinner ? (
          <SimpleClaimButton
            outcomes={data.outcomes}
            userPosition={winnerPosition}
            winner={winnerOutcome}
            tradingAddr={data.poolAddress}
          />
        ) : isEnded ? (
          <p
            className="mx-auto text-center font-chicago text-xs md:pointer-events-none"
            onClick={() => {
              window.scrollTo({
                top: document.body.scrollHeight - 400,
                behavior: "smooth",
              });
            }}
          >
            This campaign is ended
            <span className="md:hidden">, scroll down to live campaign ↓</span>
          </p>
        ) : (
          <>
            <Button
              title="UP"
              intent={"yes"}
              size={"xlarge"}
              className={"flex-auto"}
              onClick={() => {
                setOutcomeIdx(1);
                setIsBuyDialogOpen(true);
              }}
            />
            <Button
              title="DOWN"
              intent={"no"}
              size={"xlarge"}
              className={"flex-auto"}
              onClick={() => {
                setOutcomeIdx(0);
                setIsBuyDialogOpen(true);
              }}
            />
          </>
        )}
      </div>
      {!isEnded && sharePrices && sharePrices.length === 2 ? (
        <div className="flex flex-row items-center gap-1">
          <span className="font-chicago text-sm">
            %{(Number(sharePrices[1].price) * 100).toFixed(0)}
          </span>
          <div className="h-2 flex-1 bg-9red">
            <div
              className="h-2 bg-9green"
              style={{ width: `${Number(sharePrices[1].price) * 100}%` }}
            />
          </div>
          <span className="font-chicago text-sm">
            %{(Number(sharePrices[0].price) * 100).toFixed(0)}
          </span>
        </div>
      ) : null}
      {positions && positions.length > 0 ? (
        <div className="flex flex-col gap-2">
          {positions.map((p) => (
            <SimplePositionRow
              isPriceAbove={
                (assetPrices?.[assetPrices?.length - 1]?.price ?? 0) > basePrice
              }
              key={p.id}
              position={p}
              account={account}
              tradingAddr={data.poolAddress}
            />
          ))}
        </div>
      ) : null}
      <Modal
        isOpen={isBuyDialogOpen}
        setIsOpen={setIsBuyDialogOpen}
        title="Predict Price"
        boxContainerClass="md:max-w-screen max-w-[400px]"
      >
        <SimpleBuyDialog
          closeDialog={() => setIsBuyDialogOpen(false)}
          data={data}
          outcomeIdx={outcomeIdx}
          setOutcomeIdx={setOutcomeIdx}
        />
      </Modal>
    </ActiveCampaignProvider>
  );
}
