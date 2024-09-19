import clientEnv from "./clientEnv";
import appConfig from "./app";
import * as chains from "./chains";
import * as tokens from "./tokens";

const config = { ...clientEnv, ...appConfig, chains, tokens };
export default config;
