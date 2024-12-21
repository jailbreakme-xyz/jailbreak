/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [{ hostname: "storage.googleapis.com" }],
  },
};

export default nextConfig;
