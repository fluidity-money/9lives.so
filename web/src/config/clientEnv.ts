import z from "zod";

const clientEnvSchema = z.object({
  /**
   * Thirdweb project id
   */
  NEXT_PUBLIC_WC_ID: z.string(),
  /**
   * Graphql server url
   */
  NEXT_PUBLIC_GRAPHQL_URL: z.string().url(),
  /**
   * Features url
   */
  NEXT_PUBLIC_FEATURES_URL: z.string().url(),
  /**
   * Points and achievements server url
   */
  NEXT_PUBLIC_POINTS_URL: z.string().url(),
  /**
   * Points and achievements server url
   */
  NEXT_PUBLIC_ACCOUNTS_URL: z.string().url(),
  /**
   * fUSDC address
   */
  NEXT_PUBLIC_FUSDC_ADDR: z.string().length(42),
  /**
   * Longtail amm address
   */
  NEXT_PUBLIC_AMM_ADDR: z.string().length(42),
  /**
   * Lens address
   */
  NEXT_PUBLIC_LENS_ADDR: z.string().length(42),
  /**
   * Helper contract address for create campaigns with various settlements
   */
  NEXT_PUBLIC_HELPER_FACTORY_ADDR: z.string().length(42),
  /**
   * Router contract address for buying the related tokens
   */
  NEXT_PUBLIC_BUY_HELPER_ADDR: z.string().length(42),
  NEXT_PUBLIC_BUY_HELPER2_ADDR: z.string().length(42),
  /**
   * Settlement Infra market oracle address
   */
  NEXT_PUBLIC_INFRA_ADDR: z.string().length(42),
  /**
   * Settlement AI Resolver address
   */
  NEXT_PUBLIC_AI_ADDR: z.string().length(42),
  /**
   * Settlement BEAUTY contest resolver for opinion polls
   */
  NEXT_PUBLIC_BEAUTY_ADDR: z.string().length(42),
  /**
   * Meow domains contract address
   */
  NEXT_PUBLIC_MEOW_DOMAINS_ADDR: z.string().length(42),
  /**
   * Signaller contract address
   */
  NEXT_PUBLIC_SARP_SIGNALLER_ADDR: z.string().length(42),
  /**
   * Websocket url
   */
  NEXT_PUBLIC_WS_URL: z.string().url(),

  /**
   * Blockchain network if mainnet or testnet
   */
  NEXT_PUBLIC_CHAIN: z.union([z.literal("mainnet"), z.literal("testnet")]),

  /**
   * Snitch tracking endpoint have to be declared
   */
  NEXT_PUBLIC_SNITCH_ENDPOINT: z.string().url(),

  /**
   *  Helper for claiming all fees
   */
  NEXT_PUBLIC_CLAIMANT_HELPER_ADDR: z.string().length(42),

  /**
   *  Paymaster address
   */
  NEXT_PUBLIC_PAYMASTER_ADDR: z.string().length(42),
});

type ClientEnvSchemaType = z.infer<typeof clientEnvSchema>;

/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends ClientEnvSchemaType {}
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
/* eslint-enable @typescript-eslint/no-namespace */

const clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_WC_ID: process.env.NEXT_PUBLIC_WC_ID,
  NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  NEXT_PUBLIC_FEATURES_URL: process.env.NEXT_PUBLIC_FEATURES_URL,
  NEXT_PUBLIC_FUSDC_ADDR: process.env.NEXT_PUBLIC_FUSDC_ADDR,
  NEXT_PUBLIC_AMM_ADDR: process.env.NEXT_PUBLIC_AMM_ADDR,
  NEXT_PUBLIC_LENS_ADDR: process.env.NEXT_PUBLIC_LENS_ADDR,
  NEXT_PUBLIC_POINTS_URL: process.env.NEXT_PUBLIC_POINTS_URL,
  NEXT_PUBLIC_ACCOUNTS_URL: process.env.NEXT_PUBLIC_ACCOUNTS_URL,
  NEXT_PUBLIC_HELPER_FACTORY_ADDR: process.env.NEXT_PUBLIC_HELPER_FACTORY_ADDR,
  NEXT_PUBLIC_BUY_HELPER_ADDR: process.env.NEXT_PUBLIC_BUY_HELPER_ADDR,
  NEXT_PUBLIC_BUY_HELPER2_ADDR: process.env.NEXT_PUBLIC_BUY_HELPER2_ADDR,
  NEXT_PUBLIC_INFRA_ADDR: process.env.NEXT_PUBLIC_INFRA_ADDR,
  NEXT_PUBLIC_AI_ADDR: process.env.NEXT_PUBLIC_AI_ADDR,
  NEXT_PUBLIC_BEAUTY_ADDR: process.env.NEXT_PUBLIC_BEAUTY_ADDR,
  NEXT_PUBLIC_MEOW_DOMAINS_ADDR: process.env.NEXT_PUBLIC_MEOW_DOMAINS_ADDR,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
  NEXT_PUBLIC_SARP_SIGNALLER_ADDR: process.env.NEXT_PUBLIC_SARP_SIGNALLER_ADDR,
  NEXT_PUBLIC_SNITCH_ENDPOINT: process.env.NEXT_PUBLIC_SNITCH_ENDPOINT,
  NEXT_PUBLIC_CLAIMANT_HELPER_ADDR:
    process.env.NEXT_PUBLIC_CLAIMANT_HELPER_ADDR,
  NEXT_PUBLIC_PAYMASTER_ADDR: process.env.NEXT_PUBLIC_PAYMASTER_ADDR,
});

if (!clientEnv.success) {
  console.error("Invalid client environment variables: ", clientEnv.error.name);
  throw new Error(clientEnv.error.message);
}

export default clientEnv.data;
