import clientEnv from "./clientEnv";
import appConfig from "./app";
import * as chains from "./chains";
import contracts from "./contracts";

const config = { ...clientEnv, ...appConfig, chains, contracts };
export default config;
