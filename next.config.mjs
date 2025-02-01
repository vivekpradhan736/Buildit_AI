/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Required for Netlify static hosting
  trailingSlash: true, // Ensures correct routing
  images: {
    domains: ["lh3.googleusercontent.com"],
    unoptimized: true, // Required for images to work correctly
  },
};

export default nextConfig;
