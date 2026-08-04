import * as childProcess from "child_process";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { withPostHogConfig } from "@posthog/nextjs-config";

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
        source: '/',
        destination: '/v1',
        permanent: false,
      },
      {
        source: '/simple',
        destination: '/v1',
        permanent: false,
      },
      {
        source: '/campaign/:path*',
        destination: '/v1',
        permanent: false,
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

const postHogApiKey = process.env.POSTHOG_API_KEY;
const postHogProjectId = process.env.POSTHOG_ENV_ID;

export default postHogApiKey && postHogProjectId
  ? withPostHogConfig(nextConfig, {
      personalApiKey: postHogApiKey,
      projectId: postHogProjectId,
      sourcemaps: {
        enabled: true,
        deleteAfterUpload: true,
      },
    })
  : nextConfig;
