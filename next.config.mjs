/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Explicitly use App Router (default in Next.js 14)
  experimental: {
    // Ensure we're using App Router only
  },
  // Suppress the _document warning if it appears
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Fix for micromark vendor chunk issues with react-markdown
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
