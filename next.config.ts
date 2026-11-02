import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Pages serves plain files, so the whole site is prerendered into
  // out/ at build time (see .github/workflows/deploy.yml).
  output: 'export',
  // every page becomes <route>/index.html — the one shape GitHub Pages
  // resolves without guessing, and it lets /blog/ and /blog/<post>/ coexist
  trailingSlash: true,
  images: { unoptimized: true },
  // The page scripts are imperative DOM code (GSAP pins, canvases, WebGL)
  // that must run exactly once; strict mode's double effect in dev would
  // build every pin and canvas twice.
  reactStrictMode: false,
};

export default nextConfig;
