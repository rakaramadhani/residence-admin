import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import axios config untuk ngrok header

// Import Leaflet CSS for map components
import 'leaflet/dist/leaflet.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Residence Admin - Cherry Field Housing Management",
  description: "Sistem administrasi untuk manajemen perumahan Cherry Field",
  keywords: ["housing", "management", "admin", "residence"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        {/* Add Leaflet CSS via CDN as fallback */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Favicon diganti ke ikon rumah biru */}
        <link rel="icon" type="image/svg+xml" href="/home-favicon.svg" />
      </head>
      <body 
        className="bg-white font-sans antialiased"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
