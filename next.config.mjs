import nextPWA from "next-pwa"

/** @type {import('next').NextConfig} */

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  customWorkerDir: "serviceworker",
})

const nextConfig = withPWA({
  reactStrictMode: true,
})

export default nextConfig
