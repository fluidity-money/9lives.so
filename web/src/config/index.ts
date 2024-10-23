import clientEnv from "./clientEnv";
import appConfig from "./app";
import * as chains from "./chains";
import contracts from "./contracts";
import thirdweb from "./thirdweb";

const config = { ...clientEnv, ...appConfig, chains, contracts, thirdweb };
export default config;
