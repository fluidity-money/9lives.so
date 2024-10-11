import clientEnv from "./clientEnv";
import appConfig from "./app";
import * as chains from "./chains";

const config = { ...clientEnv, ...appConfig, chains };
export default config;
