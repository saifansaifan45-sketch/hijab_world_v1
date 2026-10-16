import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HIJAB GRIP™ by HIJAB WORLD",
  description: "Secure Hold, All-Day Comfort",
  icons: {
    icon: "/assets/images/logo.jpg",
    shortcut: "/assets/images/logo.jpg",
    apple: "/assets/images/logo.jpg",
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
        <link rel="icon" type="image/jpeg" href="/assets/images/logo.jpg" />
        <link rel="apple-touch-icon" href="/assets/images/logo.jpg" />
        <link rel="stylesheet" href="/style.css?v=1791800862987" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
