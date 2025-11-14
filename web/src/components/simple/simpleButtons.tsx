"use client";
import { Outcome, SimpleCampaignDetail } from "@/types";
import Button from "../themed/button";
import useDppmRewards from "@/hooks/useDppmRewards";
import { useActiveAccount } from "thirdweb/react";
import SimpleClaimButton from "./simpleClaimButton";
import Modal from "../themed/modal";
import SimpleBuyDialog from "../simpleBuyDialog";
import { useState } from "react";

export default function SimpleButtons({
  data,
}: {
  data: SimpleCampaignDetail;
}) {
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [outcomeIdx, setOutcomeIdx] = useState(1);
  const isEnded = Date.now() > data.ending;
  const account = useActiveAccount();
  const { totalRewards } = useDppmRewards({
    tradingAddr: data.poolAddress,
    account,
    priceMetadata: data.priceMetadata,
    starting: data.starting,
    ending: data.ending,
    outcomes: data.outcomes,
  });
  const winnerOutcome = data.outcomes.find(
    (o) => o.identifier === data?.winner,
  ) as Outcome;
  return (
    <>
      <div className="sticky inset-x-0 bottom-0 z-20 flex items-center gap-2 bg-9layer pb-2 md:static md:bg-transparent md:p-0">
        {isEnded ? (
          !!winnerOutcome && totalRewards > 0 ? (
            <SimpleClaimButton
              totalRewards={totalRewards}
              tradingAddr={data.poolAddress}
              outcomes={data.outcomes}
            />
          ) : null
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
