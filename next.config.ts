import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  // Force Vercel's file tracer to bundle the Brotli-compressed Chromium binary
  // and shared libraries. Without this the .br files are excluded from the
  // Lambda deployment and the browser fails to launch with libnss3.so errors.
  outputFileTracingIncludes: {
    '/api/scrape': ['./node_modules/@sparticuz/chromium/**/*'],
  },
};

export default nextConfig;
