import { ParticipatedCampaign, RawParticipatedCampaign } from "../../types";
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
          symbol: ro.priceMetadata?.baseAsset,
          end: ro.ending,
          price: ro.priceMetadata?.priceTargetForUp,
        })
      : ro.name,
    description: ro.description,
    isDppm: ro.isDppm,
    priceMetadata: ro.priceMetadata,
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
    liquidityVested: ro.liquidityVested,
    investmentAmounts: ro.investmentAmounts.filter(Boolean),
    isDpm: ro.isDpm ?? null,
    isDppm: ro.isDppm,
    priceMetadata: ro.priceMetadata ?? null,
  };
}

export function formatSimpleCampaignDetail(
  ro: RawSimpleCampaignDetail,
): SimpleCampaignDetail {
  if (!ro) throw new Error("Campaign data is null");
  if (ro.priceMetadata === null) throw new Error("Price metadata is null");
  return {
    ...ro,
    name: formatDppmTitle({
      symbol: ro.priceMetadata?.baseAsset,
      price: ro.priceMetadata.priceTargetForUp,
      end: ro.ending,
    }),
    ending: ro.ending * 1000,
    starting: ro.starting * 1000,
    priceMetadata: ro.priceMetadata,
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
          symbol: ro.priceMetadata?.baseAsset,
          price: ro.priceMetadata?.priceTargetForUp,
          end: ro.ending,
        })
      : ro.name,
    ending: ro.ending * 1000,
    priceMetadata: ro.priceMetadata,
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
    outcomeIds: ro.outcomeIds.map((o) => `0x${o}` as `0x${string}`), // add hex prefix
    content: formatParticipatedContent(ro.content),
  };
}
