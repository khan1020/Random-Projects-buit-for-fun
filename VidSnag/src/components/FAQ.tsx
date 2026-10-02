"use client";

import { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "Is VidSnag free to use?",
        answer: "Yes! VidSnag is 100% free. There are no hidden fees, no premium plans, and no limits on downloads.",
    },
    {
        question: "Which platforms are supported?",
        answer: "VidSnag supports YouTube, Instagram, TikTok, Facebook, Twitter/X, Reddit, Vimeo, Dailymotion, and 1000+ more websites.",
    },
    {
        question: "What video qualities are available?",
        answer: "You can download videos in various qualities including 360p, 480p, 720p (HD), 1080p (Full HD), and even 4K when available.",
    },
    {
        question: "Do I need to install any software?",
        answer: "No installation required! VidSnag works directly in your browser on any device - desktop, tablet, or mobile.",
    },
    {
        question: "Is it safe to download videos?",
        answer: "Yes, VidSnag is completely safe. We don't store your data, and all downloads are processed securely.",
    },
    {
        question: "Can I download YouTube Shorts and Instagram Reels?",
        answer: "Absolutely! VidSnag supports all video formats including Shorts, Reels, Stories, and regular videos.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-16 md:py-24 bg-black/30">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Frequently Asked <span className="logo-gradient">Questions</span>
                    </h2>
                    <p className="text-gray-400">
                        Got questions? We&apos;ve got answers.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                        <div
                            key={index}
                            className="glass-card overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left"
                            >
                                <span className="font-medium text-white pr-4">{faq.question}</span>
                                <svg
                                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-4">
                                    <p className="text-gray-400 text-sm">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
