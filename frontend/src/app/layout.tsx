import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hijabworld.com"),
  title: "HIJAB GRIP™ by HIJAB WORLD",
  description: "Secure Hold, All-Day Comfort",
  icons: {
    icon: [
      { url: "/assets/brand/hijab-world-emblem-badge-128.png", sizes: "128x128", type: "image/png" },
      { url: "/assets/brand/hijab-world-emblem-badge-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "HIJAB GRIP™ by HIJAB WORLD",
    description: "Secure Hold, All-Day Comfort. Engineered zero-slip silicone architecture.",
    url: "https://hijabworld.com",
    siteName: "Hijab World",
    images: [
      {
        url: "/assets/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "HIJAB GRIP by HIJAB WORLD",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HIJAB GRIP™ by HIJAB WORLD",
    description: "Secure Hold, All-Day Comfort. Engineered zero-slip silicone architecture.",
    images: ["/assets/brand/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="128x128" href="/assets/brand/hijab-world-emblem-badge-128.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/assets/brand/hijab-world-emblem-badge-512.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="stylesheet" href="/style.css?v=1791800862987" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
