/** @type {import('next').NextConfig} */
const LISTING_CACHE = [
  { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "http", hostname: "127.0.0.1", port: "54321" },
    ],
  },
  // Listing routes are SSR'd per request but CDN-cacheable (TECHNICAL-REQUIREMENTS.md §7).
  async headers() {
    return [
      { source: "/blog", headers: LISTING_CACHE },
      { source: "/templates", headers: LISTING_CACHE },
      { source: "/blog/category/:slug*", headers: LISTING_CACHE },
    ];
  },
};

export default nextConfig;
