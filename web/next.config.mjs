import * as childProcess from "child_process";
import { withSentryConfig } from "@sentry/nextjs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitHash = childProcess
  .execSync("git rev-parse --short HEAD")
  .toString()
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GIT_HASH: gitHash,
  },
  turbopack: {
  },
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [
      {
        source: '/simple',
        destination: '/simple/campaign/btc/15mins',
        permanent: true,
      },
    ]
  },
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
