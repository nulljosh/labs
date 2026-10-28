import type { Metadata, Viewport } from "next";
import WebMCP from "@/lib/webmcp";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://maera.jaybulb.com"),
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "./" },
  title: "Maera",
  description: "Post and find lost or found pets in your area",
  openGraph: {
    type: "website",
    siteName: "Maera",
    title: "Maera",
    description: "Post and find lost or found pets in your area",
    url: "https://maera.jaybulb.com",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfdfd" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: "if(location.hostname==='pets.jaybulb.com')location.replace('https://maera.jaybulb.com'+location.pathname+location.search+location.hash)" }} />
        <WebMCP />
        {children}
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))" }} />
      </body>
    </html>
  );
}
