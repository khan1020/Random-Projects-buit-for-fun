"use client";

import { useState, useEffect, useCallback } from "react";
import VideoDownloader from "@/components/VideoDownloader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import Platforms from "@/components/Platforms";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import AdContainer from "@/components/ads/AdContainer";
import PopupAd from "@/components/ads/PopupAd";

// Track downloads for popup ad logic
const POPUP_TRIGGER_COUNT = 7; // Show popup after every 7 downloads

export default function Home() {
  const [downloadCount, setDownloadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Load download count from localStorage
    const stored = localStorage.getItem("vidsnag_download_count");
    if (stored) {
      setDownloadCount(parseInt(stored, 10));
    }
  }, []);

  const handleDownloadComplete = useCallback(() => {
    const newCount = downloadCount + 1;
    setDownloadCount(newCount);
    localStorage.setItem("vidsnag_download_count", String(newCount));

    // Show popup ad every POPUP_TRIGGER_COUNT downloads
    if (newCount % POPUP_TRIGGER_COUNT === 0) {
      setShowPopup(true);
    }
  }, [downloadCount]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section with Downloader */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Hero Content */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Download Videos from{" "}
                <span className="logo-gradient">Anywhere</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Paste any video link from YouTube, Instagram, TikTok, Facebook & 1000+ sites.
                Download in HD, Full HD, or 4K quality. Fast, free, no signup.
              </p>
            </div>

            {/* Video Downloader Component */}
            <VideoDownloader onDownloadComplete={handleDownloadComplete} />

            {/* Supported Platforms */}
            <Platforms />
          </div>
        </section>

        {/* Features Section */}
        <Features />

        {/* How It Works */}
        <HowItWorks />

        {/* FAQ Section */}
        <FAQ />
      </main>

      <Footer />

      {/* Sidebar Ad - Desktop Only */}
      <div className="hidden xl:block sidebar-ad">
        <AdContainer type="sidebar" slot="sidebar-right" />
      </div>

      {/* Bottom Banner Ad - Always Visible */}
      <div className="bottom-banner">
        <AdContainer type="banner" slot="bottom-banner" />
      </div>

      {/* Popup Ad */}
      {showPopup && <PopupAd onClose={handleClosePopup} />}
    </div>
  );
}
