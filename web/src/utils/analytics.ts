import posthog from "posthog-js";

export const EVENTS = {
  MINT: "mint",
  BURN: "burn",
  CLAIM_REWARD: "claim_reward",
  CAMPAIGN_CLICK: "campaign_click",
  CAMPAIGN_CREATE: "campaign_create",
  WALLET_CONNECT: "wallet_connect",
  OUTCOME_SELECT: "outcome_select",
  FUNDING_CLICKED: "funding_clicked",
  ADD_LIQUIDITY: "add_liquidity",
  REMOVE_LIQUIDITY: "remove_liquidity",
  CLAIM_ALL_FEES: "claim_all_fees",
  EMAIL_SUB: "email_sub",
  WITHDRAW_USDC: "withdraw_usdc",
} as const;

export const track = (
  event: (typeof EVENTS)[keyof typeof EVENTS],
  properties?: Record<string, any>,
) => {
  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.error("Failed to track event:", event, error);
  }
};
