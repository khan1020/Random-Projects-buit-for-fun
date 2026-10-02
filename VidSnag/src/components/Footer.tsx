"use client";

import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 py-12 pb-24 md:pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8">
                                <svg viewBox="0 0 40 40" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#7c3aed" />
                                            <stop offset="50%" stopColor="#ec4899" />
                                            <stop offset="100%" stopColor="#f97316" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="20" cy="20" r="18" fill="none" stroke="url(#footerLogoGradient)" strokeWidth="2.5" />
                                    <path d="M20 10 L20 24 M13 18 L20 25 L27 18" fill="none" stroke="url(#footerLogoGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 28 L28 28" fill="none" stroke="url(#footerLogoGradient)" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold logo-gradient">VidSnag</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-4">
                            Download videos from YouTube, Instagram, TikTok & 1000+ sites. Fast, free, and easy.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Home</Link></li>
                            <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</Link></li>
                            <li><Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</Link></li>
                            <li><Link href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Supported Platforms */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Supported Sites</h3>
                        <ul className="space-y-2">
                            <li><span className="text-gray-400 text-sm">YouTube</span></li>
                            <li><span className="text-gray-400 text-sm">Instagram</span></li>
                            <li><span className="text-gray-400 text-sm">TikTok</span></li>
                            <li><span className="text-gray-400 text-sm">Facebook</span></li>
                            <li><span className="text-gray-400 text-sm">Twitter/X</span></li>
                            <li><span className="text-gray-400 text-sm">& 1000+ more</span></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                            <li><Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors text-sm">Disclaimer</Link></li>
                            <li><Link href="/dmca" className="text-gray-400 hover:text-white transition-colors text-sm">DMCA</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright & Disclaimer */}
                <div className="border-t border-white/10 mt-8 pt-8">
                    <p className="text-gray-500 text-xs text-center mb-2">
                        © {currentYear} VidSnag. All rights reserved. VidSnag is not affiliated with YouTube, Instagram, TikTok, Facebook, or any other platform.
                    </p>
                    <p className="text-gray-600 text-xs text-center">
                        Disclaimer: Only download content you have the right to download. Respect copyright laws and platform terms of service.
                    </p>
                </div>
            </div>
        </footer>
    );
}
