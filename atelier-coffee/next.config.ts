import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  poweredByHeader: false,
  // Next dev binds to 0.0.0.0; permit the explicit loopback origin used locally.
  allowedDevOrigins: ['127.0.0.1'],
};
export default nextConfig;
