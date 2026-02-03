import * as childProcess from "child_process";
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
        source: '/',
        destination: '/campaign/btc/15mins',
        permanent: false,
      },
      {
        source: '/simple',
        destination: '/campaign/btc/15mins',
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

export default nextConfig
