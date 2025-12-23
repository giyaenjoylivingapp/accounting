import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',

  // Base path for GitHub Pages deployment (only in production)
  // Change '/accounting' to your repository name if different
  basePath: isProduction ? '/accounting' : '',
  assetPrefix: isProduction ? '/accounting/' : '',

  // Required for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
