import z from "zod";
import { Chain, createThirdwebClient } from "thirdweb";
import clientEnv from "./clientEnv";
import appConfig from "./app";
import chains from "./chains";
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
  theme: z.literal("light"),
  detailsButton: z.object({
    displayBalanceToken: z.record(z.string()),
    style: z.any(),
  }),
  wallets: z.array(z.any()),
  connectButton: z.object({
    label: z.string(),
    style: z.any(),
  }),
  detailsModal: z.object({
    payOptions: z.object({
      prefillBuy: z.any(),
    }),
  }),
  connectModal: z.object({
    showThirdwebBranding: z.boolean(),
  }),
  switchButton: z.object({
    style: z.any(),
    label: z.string(),
  }),
});
const wallets = [createWallet("io.metamask"), createWallet("io.rabby")];
const thirdwebValidation = thirdwebSchema.safeParse({
  metadata: {
    name: appConfig.metadata.title,
    description: appConfig.metadata.description,
    url: appConfig.metadata.metadataBase.href,
    logoUrl: appConfig.metadata.metadataBase.origin + "/images/logo.svg",
  },
  wallets,
  theme: "light",
  detailsButton: {
    displayBalanceToken: {
      [chains.superposition.id]: clientEnv.NEXT_PUBLIC_FUSDC_ADDR,
    },
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
  detailsModal: {
    payOptions: {
      prefillBuy: {
        chain: chains.superposition,
        token: {
          symbol: "USDC",
          address: clientEnv.NEXT_PUBLIC_FUSDC_ADDR,
          name: "USDC",
        },
      },
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
      paddingRight: 4,
      minWidth: "auto",
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
      color: "#ff0000",
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
    chain: Chain;
    wallets: typeof wallets;
  }),
  client: thirdwebClient,
};
export default thirdweb;
