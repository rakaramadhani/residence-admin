import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="id">
      <body className={`${inter.variable} bg-white font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
