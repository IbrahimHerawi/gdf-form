import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Global Detergent Factory — Contact Details",
  description: "Share your details with Global Detergent Factory and our team will get in touch.",
  icons: { icon: "/gdf-logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#E21F40",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
