import { ImageResponse } from "next/og";
import { requestCampaignById } from "@/providers/graphqlClient";
import Image from "next/image";
import LogoPaw from "#/images/logo-paw.svg";
import LogoText from "#/images/logo-text.svg";
import LogoDot from "#/images/logo-dot.svg";
import { ethers } from "ethers";
import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { Outcome } from "@/types";
import formatFusdc from "@/utils/formatFusdc";
async function getPrices(tradingAddr: string, outcomes: Outcome[]) {
  const provider = new ethers.JsonRpcProvider(config.chains.currentChain.rpc);
  const tradingContract = new ethers.Contract(
    tradingAddr,
    tradingAbi,
    provider,
  );
  const res = await Promise.all(
    outcomes.map(async (o) => {
      try {
        const price = await tradingContract.priceA827ED27(o.identifier);
        return { ...o, price: BigInt(price) };
      } catch (err) {
        console.error(`Error fetching price for ${o.name}:`, err);
        return { ...o, price: BigInt(0) };
      }
    }),
  );
  return res.sort((a, b) => {
    if (a.price > b.price) return -1;
    if (a.price < b.price) return 1;
    return 0;
  });
}
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
type Params = Promise<{ id: string }>;
export default async function ImageOG({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestCampaignById(id);
  if (!response)
    return new ImageResponse(
      <Image src={LogoPaw} alt="9lives.so" width={1200} height={630} />,
    );

  const outcomes = await getPrices(
    response.poolAddress,
    response.outcomes as Outcome[],
  );
  const borderList = new Array(6).fill(1);
  const TitleBorders = () => (
    <div className="relative flex h-8 flex-1 flex-col justify-between gap-0.5 bg-[#DDD] py-0.5">
      <div className="absolute inset-y-0 left-0 z-[1] w-px bg-[#EEE]" />
      <div className="absolute inset-y-0 right-0 z-[1] w-px bg-[#EEE]" />
      {borderList.map((_, index) => (
        <div key={index} className="relative z-[2] h-1 w-full bg-[#999]" />
      ))}
    </div>
  );
  const price = formatFusdc(outcomes[0].price, 2);
  const chance = Number(price) * 100;
  const outcomeName = outcomes[0].name;
  const outcomePic = outcomes[0].picture;
  return new ImageResponse(
    (
      <div className="flex flex-1 flex-col">
        <div className="flex gap-2 bg-[#CCC] px-2 py-1">
          <TitleBorders />
          <span className="font-chicago text-2xl uppercase">
            Predict Outcome
          </span>
          <TitleBorders />
        </div>
        <div className="flex flex-col gap-5 bg-9blueLight px-10 py-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src={LogoPaw} alt="9lives.so" height={60} />
              <Image src={LogoText} alt="9lives.so" height={32} />
              <Image src={LogoDot} alt="9lives.so" height={32} />
            </div>
            <span className="font-chicago text-3xl">PREDICTION MARKET</span>
          </div>
          <div className="flex flex-col gap-5 rounded-[3px] border-2 border-9black bg-9layer p-10 shadow-9ogBox">
            <div className="flex gap-10">
              {!response?.picture || !outcomePic ? null : (
                <div className="flex items-center justify-between border-2 border-9black">
                  <Image
                    src={outcomePic || response?.picture}
                    width={200}
                    height={200}
                    alt={""}
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between">
                <p className="font-chicago text-4xl">
                  {response?.name ?? "Predict on 9LIVES.so"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-[#FFFD9B] px-2 py-1 font-chicago text-3xl">
                    {chance}% CHANCE
                  </span>
                  <span className="font-chicago text-3xl">
                    END: {new Date(response.ending * 1000).toDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 rounded-[3px] border border-9black bg-9green p-7 shadow-9btnPrimaryIdle">
              <span className="text-uppercase font-geneva text-3xl">
                {outcomeName}
              </span>
              <span className="text-uppercase bg-white/30 p-1 font-geneva text-3xl">
                ${price}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-md font-geneva uppercase">
              Predict on 9lives.so
            </span>
            <span className="text-md font-geneva uppercase">
              Predict on 9lives.so
            </span>
          </div>
        </div>
      </div>
    ),
  );
}
