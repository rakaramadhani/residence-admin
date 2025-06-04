import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Redirect root path to admin login
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin/login',
        permanent: true,      
      },
    ];
  },
  
  // Configure allowed image domains
  images: {
    domains: ['lrubxwgdcidlxqyjjbsk.supabase.co'],
  },
};

export default nextConfig;