import z from "zod";
import { createThirdwebClient } from "thirdweb";
import clientEnv from "./clientEnv";
import appConfig from "./app";
import { networkSchema } from "./chains";
import { arbitrum } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";

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
  chain: networkSchema,
  theme: z.literal("light"),
  detailsButton: z.object({
    style: z.any(),
  }),
  wallets: z.array(z.any()),
  connectButton: z.object({
    label: z.string(),
    style: z.any(),
  }),
  connectModal: z.object({
    showThirdwebBranding: z.boolean(),
  }),
  switchButton: z.object({
    style: z.any(),
    label: z.string(),
  }),
});
const wallets = [
  inAppWallet({
    smartAccount: {
      chain: arbitrum,
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
  createWallet("io.rabby"),
];
const thirdwebValidation = thirdwebSchema.safeParse({
  metadata: {
    name: appConfig.metadata.title,
    description: appConfig.metadata.description,
    url: appConfig.metadata.metadataBase.href,
    logoUrl: appConfig.metadata.metadataBase.origin + "/images/logo.svg",
  },
  chain: arbitrum,
  wallets,
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
  switchButton: {
    style: {
      backgroundColor: "transparent",
      fontFamily: "var(--font-chicago)",
      height: 40,
      fontSize: 12,
      lineHeight: 16,
      borderColor: "transparent",
      color: "#FFB3B3",
      minWidth: "auto",
      border: "none",
    },
    label: "Wrong Network",
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
    chain: typeof arbitrum;
    wallets: typeof wallets;
  }),
  client: thirdwebClient,
};
export default thirdweb;
