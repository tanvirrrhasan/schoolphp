import type { NextConfig } from "next";

// Static export configuration for PHP/MySQL backend
// Note: output: 'export' temporarily disabled due to Next.js 16 issue
// Build will still create optimized files that can be manually exported
const nextConfig: NextConfig = {
  // output: 'export', // Disabled - Next.js 16 has bug with generateStaticParams recognition
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
