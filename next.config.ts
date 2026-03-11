import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['crawlee', '@crawlee/cheerio'],
};

export default nextConfig;
