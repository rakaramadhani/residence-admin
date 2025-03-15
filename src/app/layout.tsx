import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const geistInter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Residence",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistInter.variable} bg-white`}
      >
        {children}
      </body>
    </html>
  );
}
