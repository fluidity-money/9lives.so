import posthog from "posthog-js";

export const EVENTS = {
  MINT: "mint",
  CLAIM_REWARD: "claim_reward",
  CAMPAIGN_CLICK: "campaign_click",
  CAMPAIGN_CREATE: "campaign_create",
  WALLET_CONNECT: "wallet_connect",
  OUTCOME_SELECT: "outcome_select",
  FUNDING_CLICKED: "funding_clicked",
  EMAIL_SUB: "email_sub",
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
