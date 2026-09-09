import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel auto-handles output. Do NOT set output: "standalone" — that's
     for self-hosting (Docker/VPS) and breaks Vercel's Next.js runtime,
     causing every route to 404 even though the build "succeeds". */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
