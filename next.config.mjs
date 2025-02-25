import nextPWA from "next-pwa"

/** @type {import('next').NextConfig} */

const withPWA = nextPWA({
  dest: "public",
  importScripts: ["/sw.js"],
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})

const nextConfig = withPWA({
  reactStrictMode: true,
})

export default nextConfig
