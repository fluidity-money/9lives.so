import clientEnv from "./clientEnv";
import appConfig from "./app";
import chains, { destinationChain, farcasterChains } from "./chains";
import contracts from "./contracts";
import thirdweb from "./thirdweb";

const config = {
  ...clientEnv,
  ...appConfig,
  chains,
  farcasterChains,
  destinationChain,
  contracts,
  thirdweb,
};
export default config;
