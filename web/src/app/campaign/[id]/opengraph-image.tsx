import { ImageResponse } from "next/og";
import { requestCampaignById } from "@/providers/graphqlClient";
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
  const priceFn = tradingContract.getFunction("priceA827ED27");
  const res = await Promise.all(
    outcomes.map(async (o) => {
      try {
        const price = await priceFn.staticCall(o.identifier);
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
  const baseUrl = config.metadata.metadataBase;
  if (!response)
    return new ImageResponse(
      (
        <img
          src={`${baseUrl}/${LogoText.src}`}
          alt="9lives.so"
          width={1200}
          height={630}
        />
      ),
    );

  const outcomes = await getPrices(
    response.poolAddress,
    response.outcomes as Outcome[],
  );
  const borderList = new Array(6).fill(1);
  const TitleBorders = () => (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: 32,
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 2,
        backgroundColor: "#DDD",
        paddingTop: 2,
        paddingBottom: 2,
      }}
    >
      {/* Left vertical line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1,
          width: 1,
          backgroundColor: "#EEE",
        }}
      />
      {/* Right vertical line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          zIndex: 1,
          width: 1,
          backgroundColor: "#EEE",
        }}
      />
      {/* The list of horizontal bars */}
      {borderList.map((_, index) => (
        <div
          key={index}
          style={{
            position: "relative",
            zIndex: 2,
            height: 4,
            width: "100%",
            backgroundColor: "#999",
            marginBottom: index === borderList.length - 1 ? 0 : 2,
          }}
        />
      ))}
    </div>
  );
  const price = formatFusdc(outcomes[0].price, 2);
  const chance = Number(price) * 100;
  const outcomeName = outcomes[0].name;
  const outcomePic = outcomes[0].picture;
  return new ImageResponse(
    (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            backgroundColor: "#CCC",
            padding: "0.25rem 0.5rem",
          }}
        >
          <TitleBorders />
          <span
            style={{
              fontFamily: '"Chicago", sans-serif',
              fontSize: "1.5rem",
              textTransform: "uppercase",
            }}
          >
            Predict Outcome
          </span>
          <TitleBorders />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            backgroundColor: "#DDEAEF",
            padding: "1.75rem 2.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src={`${baseUrl}/${LogoPaw.src}`}
                alt="9lives.so"
                height={60}
              />
              <img
                src={`${baseUrl}/${LogoText.src}`}
                alt="9lives.so"
                height={32}
              />
              <img
                src={`${baseUrl}/${LogoDot.src}`}
                alt="9lives.so"
                height={32}
              />
            </div>
            <span
              style={{
                fontFamily: '"Chicago", sans-serif',
                fontSize: "1.875rem",
              }}
            >
              PREDICTION MARKET
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              borderRadius: 3,
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#0C0C0C",
              backgroundColor: "#F5F5F5",
              padding: "2.5rem",
              boxShadow:
                "-4px -4px 0px 0px rgba(0, 0, 0, 0.25) inset, 4px 4px 0px 0px rgba(255, 255, 255, 0.90) inset, 2px 2px 0px 0px rgba(12, 12, 12, 0.20)",
            }}
          >
            <div style={{ display: "flex", gap: "2.5rem" }}>
              {!response?.picture || !outcomePic ? null : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: "#0C0C0C",
                  }}
                >
                  <img
                    src={outcomePic || response?.picture}
                    width={200}
                    height={200}
                    alt=""
                  />
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontFamily: '"Chicago", sans-serif',
                    fontSize: "2.25rem",
                  }}
                >
                  {response?.name ?? "Predict on 9LIVES.so"}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#FFFD9B",
                      padding: "0.25rem 0.5rem",
                      fontFamily: '"Chicago", sans-serif',
                      fontSize: "1.875rem",
                    }}
                  >
                    {chance}% CHANCE
                  </span>
                  <span
                    style={{
                      fontFamily: '"Chicago", sans-serif',
                      fontSize: "1.875rem",
                    }}
                  >
                    END: {new Date(response.ending * 1000).toDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                borderRadius: 3,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "#0C0C0C",
                backgroundColor: "#B8F2AA",
                padding: "1.75rem",
                boxShadow:
                  '"-2px -2px 0 rgba(0,0,0,0.20) inset, 2px 2px 0 rgba(0, 0, 0, 0.25)',
              }}
            >
              <span
                style={{
                  textTransform: "uppercase",
                  fontFamily: "Geneva, sans-serif",
                  fontSize: "1.875rem",
                }}
              >
                {outcomeName}
              </span>
              <span
                style={{
                  textTransform: "uppercase",
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  padding: "0.25rem 0.25rem",
                  fontFamily: "Geneva, sans-serif",
                  fontSize: "1.875rem",
                }}
              >
                ${price}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "1rem",
                fontFamily: "Geneva, sans-serif",
                textTransform: "uppercase",
              }}
            >
              Predict on 9lives.so
            </span>
            <span
              style={{
                fontSize: "1rem",
                fontFamily: "Geneva, sans-serif",
                textTransform: "uppercase",
              }}
            >
              Predict on 9lives.so
            </span>
          </div>
        </div>
      </div>
    ),
  );
}
