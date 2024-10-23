import z from "zod";
import { createThirdwebClient } from "thirdweb";
import clientEnv from "./clientEnv";
import appConfig from "./app";
import { superpositionTestnet, networkSchema } from "./chains";

const thirdwebClientId = clientEnv.NEXT_PUBLIC_THIRDWEB_ID;

const thirdwebClient = createThirdwebClient({
  clientId: thirdwebClientId,
});
type ThirdwebSchemaType = z.infer<typeof thirdwebSchema>;
const thirdwebSchema = z.object({
  metadata: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    logoUrl: z.string().url(),
  }),
  accountAbstraction: z.object({
    sponsorGas: z.boolean(),
    chain: networkSchema,
  }),
  chain: networkSchema,
  theme: z.literal("light"),
  detailsButton: z.object({
    style: z.any(),
  }),
  connectButton: z.object({
    label: z.string(),
    style: z.any(),
  }),
  connectModal: z.object({
    showThirdwebBranding: z.boolean(),
  }),
});

const thirdwebValidation = thirdwebSchema.safeParse({
  metadata: {
    name: appConfig.metadata.title,
    description: appConfig.metadata.description,
    url: appConfig.metadata.metadataBase.href,
    logoUrl: appConfig.metadata.metadataBase.origin + "/images/logo.svg",
  },
  accountAbstraction: {
    sponsorGas: true,
    chain: superpositionTestnet,
  },
  chain: superpositionTestnet,
  theme: "light",
  detailsButton: {
    style: {
      backgroundColor: "transparent",
      fontFamily: "var(--font-chicago)",
      height: 40,
      fontSize: 12,
      lineHeight: 16,
      borderColor: "transparent",
      minWidth: "auto",
      border: "none",
    },
  },
  connectButton: {
    label: "Connect Wallet",
    style: {
      color: "#0c0c0c",
      textDecoration: "underline",
      backgroundColor: "transparent",
      fontFamily: "var(--font-chicago)",
      height: 40,
      fontSize: 12,
      lineHeight: 16,
    },
  },
  connectModal: {
    showThirdwebBranding: false,
  },
});

if (!thirdwebValidation.success) {
  console.error(
    "Invalid thirdwen config variables: ",
    thirdwebValidation.error.name,
  );
  throw new Error(thirdwebValidation.error.message);
}

const thirdweb = {
  ...(thirdwebValidation.data as ThirdwebSchemaType & {
    chain: typeof superpositionTestnet;
    accountAbstraction: {
      sponsorGas: boolean;
      chain: typeof superpositionTestnet;
    };
  }),
  client: thirdwebClient,
};

export default thirdweb;
