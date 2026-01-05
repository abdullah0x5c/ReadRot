import type { Metadata, Viewport } from "next";
import "./globals.css";

// ==========================================
// Root Layout
// ==========================================
// Main layout wrapper for the entire app

export const metadata: Metadata = {
  title: "ReadRot - Read Books Like TikTok",
  description: "Transform books into brain-rot style reels. Scroll through literature like TikTok.",
  keywords: ["reading", "books", "tiktok", "reels", "text-to-speech", "audiobook"],
  authors: [{ name: "ReadRot" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload fonts for better performance */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Satoshi font for body text */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/* Clash Display for headlines */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
