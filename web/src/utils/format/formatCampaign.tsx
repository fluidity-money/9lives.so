import {
  ClaimedCampaign,
  ParticipatedCampaign,
  RawClaimedCampaign,
  RawParticipatedCampaign,
  RawUnclaimedCampaign,
  SimpleMarketKey,
  UnclaimedCampaign,
} from "../../types";
import {
  Campaign,
  CampaignDetail,
  Outcome,
  RawCampaign,
  RawCampaignDetail,
  RawOutcome,
  RawSimpleCampaignDetail,
  SimpleCampaignDetail,
} from "@/types";
import { formatDppmTitle, formatDppmOutcomeName } from "./formatDppmName";
import config from "@/config";
import formatFusdc from "./formatUsdc";

export function formatPriceMetadata(
  ro: { priceTargetForUp: string; baseAsset: string } | null,
) {
  if (!ro) return null;
  const symbol = ro.baseAsset.toLowerCase() as SimpleMarketKey;
  return {
    priceTargetForUp: Number(ro.priceTargetForUp).toFixed(
      config.simpleMarkets[symbol].decimals,
    ),
    baseAsset: symbol,
  };
}

export function formatCampaign(ro: RawCampaign): Campaign {
  return {
    identifier: ro.identifier as `0x${string}`,
    poolAddress: ro.poolAddress as `0x${string}`,
    isYesNo:
      ro.outcomes?.length === 2 &&
      ro.outcomes.findIndex((o) => o.name === "Yes") !== -1 &&
      ro.outcomes.findIndex((o) => o.name === "No") !== -1,
    outcomes: ro.outcomes?.map((o) => formatOutcome(o, ro.isDppm)),
    name: ro.isDppm
      ? formatDppmTitle({
          symbol: formatPriceMetadata(ro.priceMetadata)?.baseAsset,
          end: ro.ending * 1000,
          price: ro.priceMetadata?.priceTargetForUp,
        })
      : ro.name,
    description: ro.description,
    isDppm: ro.isDppm,
    priceMetadata: formatPriceMetadata(ro.priceMetadata),
    odds: ro.odds,
    winner: ro.winner ?? null,
    picture: ro.picture ?? null,
    oracleDescription: ro.oracleDescription ?? null,
    oracleUrls: ro.oracleUrls ?? null,
    settlement: ro.settlement,
    ending: ro.ending * 1000,
    starting: ro.starting * 1000,
    shares: ro.shares ?? [],
    totalVolume: ro.totalVolume,
    creator: ro.creator,
  };
}

export function formatCampaignDetail(ro: RawCampaignDetail): CampaignDetail {
  if (!ro) throw new Error("Campaign data is null");

  return {
    ...formatCampaign(ro),
    categories: ro.categories,
    liquidityVested: ro.liquidityVested,
    investmentAmounts: ro.investmentAmounts.filter(Boolean),
    isDpm: ro.isDpm ?? null,
    isDppm: ro.isDppm,
  };
}

export function formatSimpleCampaignDetail(
  ro: RawSimpleCampaignDetail,
): SimpleCampaignDetail {
  if (!ro) throw new Error("Campaign data is null");
  if (ro.priceMetadata === null) throw new Error("Price metadata is null");
  return {
    ...ro,
    isDpm: false,
    isDppm: true,
    name: formatDppmTitle({
      symbol: formatPriceMetadata(ro.priceMetadata)?.baseAsset,
      price: ro.priceMetadata.priceTargetForUp,
      end: ro.ending * 1000,
    }),
    ending: ro.ending * 1000,
    starting: ro.starting * 1000,
    priceMetadata: formatPriceMetadata(ro.priceMetadata)!,
    poolAddress: ro.poolAddress as `0x${string}`,
    identifier: ro.identifier as `0x${string}`,
    outcomes: ro.outcomes.map((o) => formatOutcome(o, true)),
  };
}

export function formatOutcome(ro: RawOutcome, isDppm?: boolean): Outcome {
  return {
    identifier: ro.identifier as `0x${string}`,
    name: isDppm ? formatDppmOutcomeName(ro.name) : ro.name,
    picture: ro.picture ?? null,
    share: { address: ro.share.address as `0x${string}` },
  };
}

export function formatParticipatedContent(
  ro: NonNullable<RawParticipatedCampaign>["content"],
) {
  if (!ro) throw new Error("Campaign content is null");
  if (ro.isDppm && !ro.priceMetadata)
    throw new Error("Campaign price metadata is null");

  return {
    ...ro,
    name: ro.isDppm
      ? formatDppmTitle({
          symbol: formatPriceMetadata(ro.priceMetadata)?.baseAsset,
          price: ro.priceMetadata?.priceTargetForUp,
          end: ro.ending * 1000,
        })
      : ro.name,
    starting: ro.starting * 1000,
    ending: ro.ending * 1000,
    priceMetadata: formatPriceMetadata(ro.priceMetadata),
    poolAddress: ro.poolAddress as `0x${string}`,
    identifier: ro.identifier as `0x${string}`,
    outcomes: ro.outcomes.map((o) => formatOutcome(o, ro.isDppm)),
  };
}

export function formatParticipatedCampaign(
  ro: RawParticipatedCampaign,
): ParticipatedCampaign {
  if (!ro) throw new Error("Campaign data is null");
  return {
    campaignId: ro.campaignId as `0x${string}`,
    content: formatParticipatedContent(ro.content),
  };
}

export function formatClaimedCampaign(ro: RawClaimedCampaign): ClaimedCampaign {
  if (!ro) throw new Error("Campaign data is null");
  if (!ro.content) throw new Error("Campaign content data is null");
  return {
    ...ro,
    content: {
      ...ro.content,
      name: ro.content.isDppm
        ? formatDppmTitle({
            symbol:
              ro.content.priceMetadata!.baseAsset.toLowerCase() as SimpleMarketKey,
            price: ro.content.priceMetadata?.priceTargetForUp,
            end: ro.content.ending * 1000,
          })
        : ro.content.name,
      outcomes: ro.content.outcomes.map((o) => ({
        identifier: o.identifier as `0x${string}`,
        name: ro.content.isDppm ? formatDppmOutcomeName(o.name) : o.name,
        picture: o.picture ?? null,
      })),
    },
  };
}

export function formatUnclaimedCampaign(
  ro: RawUnclaimedCampaign,
): UnclaimedCampaign {
  if (!ro) throw new Error("Campaign is null");
  if (!ro.campaign.priceMetadata)
    throw new Error("Campaign priceMetadata is null");
  const priceMetadata = formatPriceMetadata(ro.campaign.priceMetadata)!;

  return {
    ...ro.campaign,
    poolAddress: ro.campaign.poolAddress as `0x${string}`,
    identifier: ro.campaign.identifier as `0x${string}`,
    outcomes: ro.campaign.outcomes.map((o) => formatOutcome(o)),
    totalSpent: +formatFusdc(ro.totalSpent, 2),
    priceMetadata,
    ending: ro.campaign.ending * 1000,
    starting: ro.campaign.starting * 1000,
    name: formatDppmTitle({
      symbol: priceMetadata.baseAsset,
      price: priceMetadata.priceTargetForUp,
      end: ro.campaign.ending * 1000,
    }),
  };
}
