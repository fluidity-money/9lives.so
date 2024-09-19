import z from "zod";

const clientEnvSchema = z.object({
  /**
   * Walletconnect project id.
   */
  NEXT_PUBLIC_THIRDWEB_ID: z.string(),
});

type ClientEnvSchemaType = z.infer<typeof clientEnvSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ClientEnvSchemaType {}
  }
}

const clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_THIRDWEB_ID: process.env.NEXT_PUBLIC_THIRDWEB_ID,
});

if (!clientEnv.success) {
  console.error("Invalid client environment variables: ", clientEnv.error.name);
  throw new Error(clientEnv.error.message);
}

export default clientEnv.data;
