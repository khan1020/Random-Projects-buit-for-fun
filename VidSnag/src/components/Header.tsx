"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b backdrop-blur-xl">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        {/* Logo Icon */}
                        <div className="relative w-10 h-10">
                            <svg viewBox="0 0 40 40" className="w-full h-full">
                                {/* Outer gradient ring */}
                                <defs>
                                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#7c3aed" />
                                        <stop offset="50%" stopColor="#ec4899" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="18"
                                    fill="none"
                                    stroke="url(#logoGradient)"
                                    strokeWidth="2.5"
                                />
                                {/* Download arrow */}
                                <path
                                    d="M20 10 L20 24 M13 18 L20 25 L27 18"
                                    fill="none"
                                    stroke="url(#logoGradient)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {/* Bottom line */}
                                <path
                                    d="M12 28 L28 28"
                                    fill="none"
                                    stroke="url(#logoGradient)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        {/* Logo Text */}
                        <span className="text-2xl font-extrabold logo-gradient tracking-tight">
                            VidSnag
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="#features"
                            className="text-gray-400 hover:text-white transition-colors font-medium"
                        >
                            Features
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="text-gray-400 hover:text-white transition-colors font-medium"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="#faq"
                            className="text-gray-400 hover:text-white transition-colors font-medium"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="#"
                            className="btn-gradient text-sm py-2 px-5"
                        >
                            <span>Get Started</span>
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden py-4 border-t border-white/10">
                        <div className="flex flex-col gap-4">
                            <Link
                                href="#features"
                                className="text-gray-400 hover:text-white transition-colors font-medium py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="text-gray-400 hover:text-white transition-colors font-medium py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                How It Works
                            </Link>
                            <Link
                                href="#faq"
                                className="text-gray-400 hover:text-white transition-colors font-medium py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                FAQ
                            </Link>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}
