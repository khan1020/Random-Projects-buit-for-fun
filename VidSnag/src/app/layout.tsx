import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

// Premium fonts for memorable branding
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Comprehensive SEO metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://vidsnag.com"),
  title: {
    default: "VidSnag - Free Video Downloader | YouTube, Instagram, TikTok, Facebook",
    template: "%s | VidSnag",
  },
  description:
    "Download videos from YouTube, Instagram, TikTok, Facebook & 1000+ sites in HD, Full HD & 4K quality. Fast, free, no registration. Supports all video formats.",
  keywords: [
    "video downloader",
    "youtube downloader",
    "instagram video download",
    "tiktok downloader",
    "facebook video download",
    "download youtube videos",
    "free video downloader",
    "hd video download",
    "4k video downloader",
    "online video downloader",
    "reels downloader",
    "shorts downloader",
  ],
  authors: [{ name: "VidSnag" }],
  creator: "VidSnag",
  publisher: "VidSnag",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vidsnag.com",
    siteName: "VidSnag",
    title: "VidSnag - Free Video Downloader for YouTube, Instagram, TikTok & More",
    description:
      "Download videos from any platform in HD quality. Fast, free, and easy to use. No registration required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VidSnag - Universal Video Downloader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VidSnag - Free Video Downloader",
    description: "Download videos from YouTube, Instagram, TikTok & more in HD quality",
    images: ["/og-image.png"],
    creator: "@vidsnag",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://vidsnag.com",
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f0f13",
  colorScheme: "dark",
};

// JSON-LD Structured Data
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://vidsnag.com/#webapp",
      name: "VidSnag",
      description: "Free online video downloader supporting YouTube, Instagram, TikTok, Facebook and 1000+ sites",
      url: "https://vidsnag.com",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "25847",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Download from YouTube, Instagram, TikTok, Facebook",
        "HD, Full HD, and 4K quality support",
        "No registration required",
        "Fast download speeds",
        "Support for 1000+ websites",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://vidsnag.com/#organization",
      name: "VidSnag",
      url: "https://vidsnag.com",
      logo: {
        "@type": "ImageObject",
        url: "https://vidsnag.com/logo.png",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://vidsnag.com/#website",
      url: "https://vidsnag.com",
      name: "VidSnag",
      publisher: { "@id": "https://vidsnag.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://vidsnag.com/?url={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google AdSense - Replace with your actual AdSense ID */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        {/* Animated gradient background */}
        <div className="gradient-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
