import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // negeert alle ESLint errors tijdens build
  },
  // andere config opties blijven hier
};

export default nextConfig;
