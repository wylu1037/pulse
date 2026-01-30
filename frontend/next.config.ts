import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ["geist"],
  env: {
    NEXT_PUBLIC_PB_URL: process.env.NEXT_PUBLIC_PB_URL || "http://localhost:8090",
  },
}

export default nextConfig
