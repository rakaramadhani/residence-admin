import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Nonaktifkan Strict Mode
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin/login',
        permanent: true,      
      },
    ];
  },
  images: {
    domains: ['lrubxwgdcidlxqyjjbsk.supabase.co'],
  },
};

export default nextConfig;