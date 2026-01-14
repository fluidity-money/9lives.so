import z from "zod";

const serverEnvSchema = z.object({
  /**
   * Graphql schema path for codegen
   */
  GRAPHQL_SCHEMA: z.string(),
});

type ServerEnvSchemaType = z.infer<typeof serverEnvSchema>;

/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends ServerEnvSchemaType {}
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
/* eslint-enable @typescript-eslint/no-namespace */

const serverEnv = serverEnvSchema.safeParse({
  GRAPHQL_SCHEMA: process.env.GRAPHQL_SCHEMA,
});

if (!serverEnv.success) {
  console.error("Invalid server environment variables: ", serverEnv.error.name);
  throw new Error(serverEnv.error.message);
}

export default serverEnv.data;
