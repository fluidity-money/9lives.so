import { Action, BuyAndSellResponse, CreationResponse } from "@/types";
import formatFusdc from "../formatFusdc";

export function formatActionFromCreation(
  response: CreationResponse["ninelives_campaigns_1"][number],
): Action {
  return {
    id: response.id,
    campaignId: response.id,
    type: "create",
    campaignName: response.content.name,
    timestamp: response.created_at,
    campaignPic: response.content.picture,
  };
}

export function formatActionFromBuysAndSells(
  response: BuyAndSellResponse["ninelives_buys_and_sells_1"][number],
): Action {
  const actionValue = formatFusdc(
    response.from_symbol === "FUSDC"
      ? response.from_amount
      : response.to_amount,
    2,
  );

  const campaignVol = formatFusdc(response.total_volume, 2);

  const outcomeName = response.campaign_content.outcomes.find(
    (o) => o.identifier === `0x${response.outcome_id}`,
  )?.name;

  return {
    id: response.transaction_hash,
    type: response.type,
    campaignId: response.campaign_id,
    campaignName: response.campaign_content.name,
    timestamp: response.created_by,
    campaignPic: response.campaign_content.picture,
    campaignVol,
    actionValue,
    outcomeName,
  };
}
