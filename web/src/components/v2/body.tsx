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
import { combineClass } from "@/utils/combineClass";
import { useHotkey } from "@tanstack/react-hotkeys";

const RightCarot = ({ className = "size-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.26186 19.6922L16.2161 12.738C16.3133 12.6411 16.3905 12.5259 16.4431 12.3992C16.4958 12.2724 16.5229 12.1364 16.5229 11.9991C16.5229 11.8618 16.4958 11.7259 16.4431 11.5991C16.3905 11.4723 16.3133 11.3572 16.2161 11.2602L9.26186 4.30606C9.0659 4.11009 8.80012 4 8.52298 4C8.24585 4 7.98006 4.11009 7.7841 4.30606C7.58813 4.50202 7.47804 4.7678 7.47804 5.04494C7.47804 5.32207 7.58813 5.58786 7.7841 5.78382L14.0003 12L7.78323 18.2162C7.58726 18.4121 7.47717 18.6779 7.47717 18.9551C7.47717 19.2322 7.58726 19.498 7.78323 19.6939C7.97919 19.8899 8.24498 20 8.52211 20C8.79925 20 9.06503 19.8899 9.26099 19.6939L9.26186 19.6922Z"
      fill="#181818"
    />
  </svg>
);

export default function SimpleBody({
  initialAssets,
  campaignData,
}: {
  campaignData: SimpleCampaignDetail;
  initialAssets: RawAsset[];
}) {
  const { symbol, period, setSymbol, setPeriod } = useContext(NavContext);
  const { data } = useQuery<SimpleCampaignDetail>({
    queryKey: ["simpleCampaign", symbol, period],
    initialData: campaignData,
    staleTime: 0,
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
  const buttonStyle = `md:flex absolute inset-y-0 px-4 items-center justify-center hover:bg-neutral-200 bg-neutral-100 rounded-xl cursor-pointer hidden`;
  useHotkey("Mod+ArrowRight", () => {
    handleNextCamp();
  });
  useHotkey("Mod+ArrowLeft", () => {
    handleNextCamp();
  });
  useHotkey("Mod+ArrowUp", () => {
    setOutcomeIdx(1);
    setIsBuyDialogOpen(true);
  });
  useHotkey("Mod+ArrowDown", () => {
    setOutcomeIdx(0);
    setIsBuyDialogOpen(true);
  });
  return (
    <>
      <div className="relative rounded-xl border border-neutral-400 bg-2white p-4">
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
        <div
          onClick={handlePrevCamp}
          className={combineClass(buttonStyle, "left-[-72px]")}
        >
          <RightCarot className="size-6 rotate-180" />
        </div>
        <div
          onClick={handleNextCamp}
          className={combineClass(buttonStyle, "right-[-72px]")}
        >
          <RightCarot />
        </div>
      </div>
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
