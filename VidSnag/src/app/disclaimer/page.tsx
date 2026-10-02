"use client";

import Link from "next/link";

export default function Disclaimer() {
    return (
        <main className="min-h-screen py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-outfit)] mb-4">
                        Disclaimer
                    </h1>
                    <p className="text-gray-400">Last updated: January 2024</p>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none space-y-8">
                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">General Disclaimer</h2>
                        <p className="text-gray-300 leading-relaxed">
                            VidSnag is provided as a tool to help users download publicly available video content
                            for personal, non-commercial use. We are not affiliated with, endorsed by, or connected
                            to YouTube, Instagram, TikTok, Facebook, Twitter, or any other platform.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Copyright Responsibility</h2>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-4">
                            <p className="text-red-200 leading-relaxed">
                                <strong>Users are solely responsible for ensuring they have the legal right to
                                    download any content.</strong> VidSnag does not encourage, condone, or promote
                                copyright infringement.
                            </p>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            Before downloading any video, please ensure:
                        </p>
                        <ul className="text-gray-300 space-y-2 list-disc list-inside mt-4">
                            <li>You own the content or have explicit permission from the owner</li>
                            <li>The content is in the public domain</li>
                            <li>The content is licensed under Creative Commons or similar licenses that allow downloads</li>
                            <li>Your use falls under fair use/fair dealing provisions in your jurisdiction</li>
                        </ul>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">No Hosting</h2>
                        <p className="text-gray-300 leading-relaxed">
                            VidSnag does not host, store, or cache any video content. We simply provide a
                            technical interface to download publicly accessible content directly from third-party
                            servers to the user&apos;s device.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Platforms</h2>
                        <p className="text-gray-300 leading-relaxed">
                            When you use VidSnag, you are also subject to the Terms of Service of the platform
                            from which you are downloading content. Downloading content may violate the terms
                            of some platforms. Users should review and comply with all applicable terms of service.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">No Warranty</h2>
                        <p className="text-gray-300 leading-relaxed">
                            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                            OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE AVAILABLE, UNINTERRUPTED,
                            SECURE, OR ERROR-FREE. USE OF THIS SERVICE IS AT YOUR OWN RISK.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
                        <p className="text-gray-300 leading-relaxed">
                            VidSnag and its operators shall not be held liable for any damages arising from:
                        </p>
                        <ul className="text-gray-300 space-y-2 list-disc list-inside mt-4">
                            <li>Use or inability to use the service</li>
                            <li>Any content downloaded through the service</li>
                            <li>Copyright infringement claims resulting from user actions</li>
                            <li>Any third-party claims or losses</li>
                            <li>Service interruptions or technical failures</li>
                        </ul>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Changes</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We reserve the right to modify this disclaimer at any time. Continued use of the
                            service constitutes acceptance of any changes.
                        </p>
                    </section>
                </div>

                {/* Footer Links */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-400">
                    <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>
            </div>
        </main>
    );
}
