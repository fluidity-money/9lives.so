"use client";
import { SimpleCampaignDetail, SimpleMarketKey } from "@/types";
import SimpleButtons from "./buttons";
import SimpleChance from "./chances";
import SimplePositions from "./positions";
import SimpleModeAlert from "./modeAlert";
import { useQuery } from "@tanstack/react-query";
import PriceChartWrapper from "./chartWrapper";
import { useState } from "react";
import Modal from "./modal";
import SimpleBuyDialog from "./buyDialog";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import Image from "next/image";
import config from "@/config";
import SimpleSubHeader from "./subheader";
import ChartPointsIndicator from "./chartPointsIndicator";
import getDppmPrices from "@/utils/getDppmPrices";

export default function SimpleBody({
  symbol,
  campaignData,
}: {
  symbol: SimpleMarketKey;
  campaignData: SimpleCampaignDetail;
}) {
  const period = getPeriodOfCampaign(campaignData);
  const { data } = useQuery<SimpleCampaignDetail>({
    queryKey: ["simpleCampaign", campaignData.priceMetadata.baseAsset, period],
    initialData: campaignData,
    staleTime: 0,
    refetchOnMount: true,
  });
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [outcomeIdx, setOutcomeIdx] = useState(1);
  const enabledSimpleModeAlert = useFeatureFlag("enable simple mode alert");
  const dppmPrices = getDppmPrices(campaignData.odds);
  const sharePrices =
    dppmPrices.length === 2
      ? getDppmPrices(campaignData.odds)
      : [
          { id: campaignData.outcomes[0], price: 0.5 },
          { id: campaignData.outcomes[1], price: 0.5 },
        ];
  const chance = (index: number) =>
    (Number(sharePrices[index].price) * 100).toFixed(0);
  const yesChance = chance(1);
  const noChance = chance(0);
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
              <h1 className="text-2xl font-semibold text-2black">
                <span className="text-neutral-400">$</span>
                {data.priceMetadata?.baseAsset.toUpperCase()}
              </h1>
              <ChartPointsIndicator
                starting={campaignData.starting}
                ending={campaignData.ending}
              />
            </div>
          </div>

          <SimpleSubHeader campaignData={campaignData} />
        </div>
        <SimpleChance yes={yesChance} no={noChance} />
        <PriceChartWrapper simple={true} campaignData={data} />
        <SimplePositions
          openModal={() => setIsBuyDialogOpen(true)}
          data={data}
        />
      </div>
      <div className="sticky inset-x-0 bottom-0 z-20 flex flex-col gap-2 bg-2white pb-2 md:static md:flex-row md:bg-transparent md:p-0">
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
