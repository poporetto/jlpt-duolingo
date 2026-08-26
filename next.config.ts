import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isGitHubPages ? '/jlpt-duolingo' : '',
  assetPrefix: isGitHubPages ? '/jlpt-duolingo/' : undefined,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
