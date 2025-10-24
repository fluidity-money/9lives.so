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

export function formatCampaign(ro: RawCampaign): Campaign {
  return {
    identifier: ro.identifier as `0x${string}`,
    poolAddress: ro.poolAddress as `0x${string}`,
    isYesNo:
      ro.outcomes?.length === 2 &&
      ro.outcomes.findIndex((o) => o.name === "Yes") !== -1 &&
      ro.outcomes.findIndex((o) => o.name === "No") !== -1,
    outcomes: ro.outcomes?.map((o) => formatOutcome(o)),
    name: ro.name,
    description: ro.description,
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
    priceMetadata: ro.priceMetadata,
    poolAddress: ro.poolAddress as `0x${string}`,
    identifier: ro.identifier as `0x${string}`,
    outcomes: ro.outcomes.map((o) => formatOutcome(o)),
  };
}

export function formatOutcome(ro: RawOutcome): Outcome {
  return {
    identifier: ro.identifier as `0x${string}`,
    name: ro.name,
    picture: ro.picture ?? null,
    share: { address: ro.share.address as `0x${string}` },
  };
}
