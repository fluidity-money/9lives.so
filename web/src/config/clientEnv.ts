import z from "zod";

const clientEnvSchema = z.object({
  /**
   * Thirdweb project id
   */
  NEXT_PUBLIC_THIRDWEB_ID: z.string(),
  /**
   * Graphql server url
   */
  NEXT_PUBLIC_GRAPHQL_URL: z.string().url(),
  /**
   * Features url
   */
  NEXT_PUBLIC_FEATURES_URL: z.string().url(),
  /**
   * fUSDC address
   */
  NEXT_PUBLIC_FUSDC_ADDR: z.string().url(),
  /**
   * Factory address
   */
  NEXT_PUBLIC_FACTORY_ADDR: z.string().url(),
});

type ClientEnvSchemaType = z.infer<typeof clientEnvSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ClientEnvSchemaType {}
  }
}

const clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_THIRDWEB_ID: process.env.NEXT_PUBLIC_THIRDWEB_ID,
  NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  NEXT_PUBLIC_FEATURES_URL: process.env.NEXT_PUBLIC_FEATURES_URL,
  NEXT_PUBLIC_FUSDC_ADDR: process.env.NEXT_PUBLIC_FUSDC_ADDR,
  NEXT_PUBLIC_FACTORY_ADDR: process.env.NEXT_PUBLIC_FACTORY_ADDR,
});

if (!clientEnv.success) {
  console.error("Invalid client environment variables: ", clientEnv.error.name);
  throw new Error(clientEnv.error.message);
}

export default clientEnv.data;
