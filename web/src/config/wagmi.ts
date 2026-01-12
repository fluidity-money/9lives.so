import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import ChainList from "@/config/chains";
import clientEnv from "./clientEnv";

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: clientEnv.NEXT_PUBLIC_THIRDWEB_ID,
  networks: Object.values(ChainList),
});

export const config = wagmiAdapter.wagmiConfig;
