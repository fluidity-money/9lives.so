import clientEnv from "./clientEnv";
import appConfig from "./app";
import chains, { destinationChain } from "./chains";
import contracts from "./contracts";

const config = {
  ...clientEnv,
  ...appConfig,
  chains,
  destinationChain,
  contracts,
};
export default config;
