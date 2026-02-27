"use client";
import { RawAsset, SimpleCampaignDetail } from "@/types";
import SimpleButtons from "./buttons";
import SimpleChance from "./chances";
import SimplePositions from "./positions";
import SimpleModeAlert from "./modeAlert";
import { useQuery } from "@tanstack/react-query";
import PriceChartWrapper from "./chartWrapper";
import { useContext, useState } from "react";
import Modal from "./modal";
import SimpleBuyDialog from "./buyDialog";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import Image from "next/image";
import config from "@/config";
import SimpleSubHeader from "./subheader";
import ChartPointsIndicator from "./chartPointsIndicator";
import getDppmPrices from "@/utils/getDppmPrices";
import { NavContext } from "@/providers/navContext";
import useAssetsHourlyDelta from "@/hooks/useAssetsHourlyDelta";
import ArrowIcon from "../arrowIcon";
import { getNextCampaign, getPrevCampaign } from "@/utils/getCampaign";
import useAssets from "@/hooks/useAssets";

export default function SimpleBody({
  initialAssets,
  campaignData,
}: {
  campaignData: SimpleCampaignDetail;
  initialAssets: RawAsset[];
}) {
  const { symbol, setSymbol, setPeriod } = useContext(NavContext);
  const period = getPeriodOfCampaign(campaignData);
  const { data } = useQuery<SimpleCampaignDetail>({
    queryKey: ["simpleCampaign", symbol, period],
    initialData: campaignData,
    staleTime: 5000,
  });
  const { data: assetsRating } = useAssets(initialAssets);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [outcomeIdx, setOutcomeIdx] = useState(1);
  const enabledSimpleModeAlert = useFeatureFlag("enable simple mode alert");
  const dppmPrices = getDppmPrices(data.odds);
  const sharePrices =
    dppmPrices.length === 2
      ? getDppmPrices(data.odds)
      : [
          { id: data.outcomes[0].identifier, price: 0.5 },
          { id: data.outcomes[1].identifier, price: 0.5 },
        ];
  const id = (outcomeName: "Up" | "Down") =>
    data.outcomes.find((o) => o.name === outcomeName)?.identifier;
  const chance = (outcomeName: "Up" | "Down") =>
    (
      Number(
        sharePrices.find((sp) => sp.id === id(outcomeName))?.price ?? 0.5,
      ) * 100
    ).toFixed(0);
  const yesChance = chance("Up");
  const noChance = chance("Down");
  const { data: assets } = useAssetsHourlyDelta();
  const assetPrice = assets?.find(
    (a) => a.name.toLowerCase() === data.priceMetadata.baseAsset,
  );
  const isPriceUp =
    assetPrice && Number(assetPrice.price) >= Number(assetPrice.hourAgoPrice);
  const handleNextCamp = () => {
    const next = getNextCampaign({ symbol, period, assets: assetsRating });
    setSymbol(next.symbol);
    setPeriod(next.period);
  };
  const handlePrevCamp = () => {
    const prev = getPrevCampaign({ symbol, period, assets: assetsRating });
    setSymbol(prev.symbol);
    setPeriod(prev.period);
  };
  return (
    <>
      <div className="rounded-xl border border-neutral-400 bg-2white p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-2">
            <Image
              src={config.simpleMarkets[symbol].logo}
              width={53}
              height={53}
              alt={symbol}
              className="size-[53px] rounded-xl"
            />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <h1 className="text-2xl font-semibold text-2black">
                  <span className="text-neutral-400">$</span>
                  {data.priceMetadata?.baseAsset.toUpperCase()}
                </h1>
                {isPriceUp !== undefined ? (
                  <ArrowIcon
                    variant={isPriceUp ? "up" : "down"}
                    size="size-4"
                  />
                ) : null}
              </div>
              <ChartPointsIndicator
                starting={data.starting}
                ending={data.ending}
              />
            </div>
          </div>

          <SimpleSubHeader campaignData={data} />
        </div>
        <SimpleChance yes={yesChance} no={noChance} />
        <PriceChartWrapper simple={true} campaignData={data} />
        <SimplePositions
          openModal={() => setIsBuyDialogOpen(true)}
          data={data}
        />
      </div>
      <button onClick={handleNextCamp}>Go to next</button>
      <button onClick={handlePrevCamp}>Go to prev</button>
      <div className="sticky inset-x-0 bottom-0 z-20 flex flex-col gap-2 bg-2white md:static md:flex-row md:bg-transparent md:p-0">
        <SimpleButtons
          yes={yesChance}
          no={noChance}
          data={data}
          setIsBuyDialogOpen={setIsBuyDialogOpen}
          setOutcomeIdx={setOutcomeIdx}
        />
      </div>
      {enabledSimpleModeAlert ? <SimpleModeAlert /> : <></>}
      <Modal
        isOpen={isBuyDialogOpen}
        setIsOpen={setIsBuyDialogOpen}
        displayClose={false}
        boxContainerClass="md:max-w-screen max-w-[400px]"
      >
        <SimpleBuyDialog
          closeDialog={() => setIsBuyDialogOpen(false)}
          data={data}
          chance={outcomeIdx === 1 ? yesChance : noChance}
          outcomeIdx={outcomeIdx}
          setOutcomeIdx={setOutcomeIdx}
        />
      </Modal>
    </>
  );
}
