"use client";
import RetroCard from "@/components/cardRetro";
import { useFormStore } from "@/stores/formStore";
import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import XIcon from "#/icons/x-twitter.svg";
import GlobeInactiveIcon from "#/icons/globe-black.svg";
import TelegramIcon from "#/icons/telegram.svg";
import Button from "../themed/button";
import LipsActiveIcon from "#/images/lips.svg";
import GlobeActiveIcon from "#/icons/globe.svg";

export default function CreateCampaignPreview() {
  const preview = useFormStore((s) => s.form);
  const account = useActiveAccount();

  return (
    <RetroCard
      title="YOUR CAMPAIGN SUMMARY"
      position="middle"
      showClose={false}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          {preview?.picture ? (
            <Image
              src={preview?.picture}
              alt={preview?.name}
              width={50}
              height={50}
              className="size-[50px] border border-9black object-contain"
            />
          ) : (
            <div className="flex size-[50px] items-center justify-center border border-9black shadow-9input">
              <span className="font-geneva text-[10px] uppercase">PIC</span>
            </div>
          )}
          <div className="flex flex-col justify-between">
            <h3 className="font-chicago text-sm">
              {preview?.name || "Your campaign name"}
            </h3>
            <span className="font-geneva text-[10px] uppercase">
              BY{" "}
              {account?.address
                ? `${account.address.slice(0, 4)}...${account.address.slice(-4)}`
                : "0x"}
            </span>
          </div>
        </div>
        <p className="text-xs">
          {preview?.description ||
            "Your campaign preview is going to be displayed here"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">End Date: </span>
          <span className="bg-9yellow p-1 font-chicago text-xs">
            {preview?.endDate || "DD/MM/YYY"}
          </span>
        </div>
        {preview?.outcomeType === "default" ? (
          <div className="flex items-center gap-2">
            <Button
              intent={"yes"}
              size={"medium"}
              title="Yes"
              className={"flex-1"}
            />
            <Button
              intent={"no"}
              size={"medium"}
              title="No"
              className={"flex-1"}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {preview?.outcomes.map((item, idx) => (
              <div className="flex items-start gap-2" key={item.id}>
                {item.picture ? (
                  <Image
                    src={item.picture}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="size-10 object-contain"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center border border-9black shadow-9input">
                    {" "}
                    <span className="font-geneva text-[10px] uppercase">
                      PIC
                    </span>
                  </div>
                )}
                <div className="flex min-h-10 flex-1 flex-col gap-0.5 border border-9black p-1.5 shadow-9btnPrimaryIdle">
                  <h4 className="font-chicago text-xs">
                    {item.name || `Outcome ${idx + 1}`}
                  </h4>
                  <h5 className="font-geneva text-xs text-gray-500">
                    {item.description || "Description"}
                  </h5>
                </div>
              </div>
            ))}
          </div>
        )}
        <span className="text-sm font-bold">Settlement Source: </span>
        <div className="flex min-h-10 flex-1 items-center gap-2 border border-9black p-2.5 shadow-9btnPrimaryIdle">
          <Image
            src={
              preview?.settlementType === "beauty"
                ? LipsActiveIcon
                : GlobeActiveIcon
            }
            width={30}
            alt=""
            className=""
          />
          <span className="font-chicago text-xs">
            {preview?.settlementType === "beauty"
              ? "Beauty Contest"
              : "URL Committee"}
          </span>
        </div>
        {preview?.telegram || preview?.x || preview?.web ? (
          <div className="flex items-center justify-center gap-4 py-2.5">
            {preview?.telegram ? (
              <Image src={TelegramIcon} width={24} alt="" />
            ) : null}
            {preview?.x ? <Image src={XIcon} width={24} alt="" /> : null}
            {preview?.web ? (
              <Image src={GlobeInactiveIcon} width={24} alt="" />
            ) : null}
          </div>
        ) : null}
      </div>
    </RetroCard>
  );
}
