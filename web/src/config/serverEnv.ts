import z from "zod";

const serverEnvSchema = z.object({
  /**
   * Graphql schema path for codegen
   */
  GRAPHQL_SCHEMA: z.string(),
});

type ServerEnvSchemaType = z.infer<typeof serverEnvSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ServerEnvSchemaType {}
  }
}

const serverEnv = serverEnvSchema.safeParse({
  GRAPHQL_SCHEMA: process.env.GRAPHQL_SCHEMA,
});

if (!serverEnv.success) {
  console.error("Invalid server environment variables: ", serverEnv.error.name);
  throw new Error(serverEnv.error.message);
}

export default serverEnv.data;
