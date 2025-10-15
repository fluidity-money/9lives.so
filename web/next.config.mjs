import * as childProcess from "child_process";
import { withSentryConfig } from "@sentry/nextjs";

const gitHash = childProcess
  .execSync("git rev-parse --short HEAD")
  .toString()
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GIT_HASH: gitHash,
  },
  webpack(config) {
    if (process.env.NODE_V8_COVERAGE) {
      Object.defineProperty(config, "devtool", {
        get() {
          return "source-map";
        },
        set() { },
      });
    }
    // fixes wallet connect dependency issue https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  outputFileTracingRoot: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pictures.9lives.so',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "fluidity-money",
  project: "9lives",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  disableLogger: true,
});
