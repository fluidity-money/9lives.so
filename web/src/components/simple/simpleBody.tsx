"use client";
import { PricePoint, SimpleCampaignDetail } from "@/types";
import SimpleSubHeader from "./simpleSubHeader";
import SimpleButtons from "./simpleButtons";
import SimpleChance from "./simpleChance";
import SimplePositions from "./simplePositions";
import SimpleModeAlert from "./simpleModeAlert";
import { useQuery } from "@tanstack/react-query";
import PriceChartWrapper from "../charts/assetPriceChartWrapper";
import SimpleClaimAllButton from "./simpleClaimAllButton";
import { useState } from "react";
import Modal from "../themed/modal";
import SimpleBuyDialog from "../simpleBuyDialog";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import { EVENTS, track } from "@/utils/analytics";
import Button from "../themed/button";

export default function SimpleBody({
  campaignData,
  pointsData,
}: {
  campaignData: SimpleCampaignDetail;
  pointsData: PricePoint[];
}) {
  const period = getPeriodOfCampaign(campaignData);
  const { data } = useQuery<SimpleCampaignDetail>({
    queryKey: ["simpleCampaign", campaignData.priceMetadata.baseAsset, period],
    initialData: campaignData,
  });
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [outcomeIdx, setOutcomeIdx] = useState(1);
  const enabledSimpleModeAlert = useFeatureFlag("enable simple mode alert");
  const [simpleChart, setSimpleChart] = useState(true);
  const handleZoomBtnClick = () => {
    setSimpleChart(!simpleChart);
    track(EVENTS.ZOOM_CHART, {
      direction: simpleChart ? "in" : "out",
      asset: data.priceMetadata?.baseAsset,
      targetPrice: data.priceMetadata?.priceTargetForUp,
      moment: Number(
        new Date().toLocaleString("en-US", {
          timeZone: "UTC",
          minute: "numeric",
        }),
      ),
    });
  };
  return (
    <>
      {enabledSimpleModeAlert ? <SimpleModeAlert /> : <></>}
      <SimpleSubHeader campaignData={data} pointsData={pointsData} />
      <div className="relative">
        <Button
          onClick={handleZoomBtnClick}
          title={simpleChart ? "Zoom In" : "Zoom Out"}
          className={"absolute left-0 top-0 z-[9]"}
          size={"small"}
        />
        <PriceChartWrapper
          simple={simpleChart}
          campaignData={data}
          pointsData={pointsData}
        />
      </div>
      <div className="sticky inset-x-0 bottom-0 z-20 flex flex-col gap-2 bg-9layer pb-2 md:static md:flex-row md:bg-transparent md:p-0">
        <SimpleClaimAllButton />
        <SimpleButtons
          data={data}
          setIsBuyDialogOpen={setIsBuyDialogOpen}
          setOutcomeIdx={setOutcomeIdx}
        />
      </div>
      <SimpleChance data={data} />
      <SimplePositions data={data} />
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
    </>
  );
}
