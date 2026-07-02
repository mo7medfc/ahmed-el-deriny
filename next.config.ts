import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const onOneDrive = process.cwd().includes("OneDrive");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Turbopack + OneDrive corrupts .next manifests → white page. Use webpack in dev.
  ...(onOneDrive
    ? {
        webpack: (config, { dev }) => {
          if (dev) {
            config.watchOptions = {
              poll: 1000,
              aggregateTimeout: 300,
            };
          }
          return config;
        },
      }
    : {}),
};

export default withNextIntl(nextConfig);
