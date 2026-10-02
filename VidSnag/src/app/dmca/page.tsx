"use client";

import Link from "next/link";

export default function DMCA() {
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
                        DMCA Policy
                    </h1>
                    <p className="text-gray-400">Digital Millennium Copyright Act Compliance</p>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none space-y-8">
                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Our Commitment</h2>
                        <p className="text-gray-300 leading-relaxed">
                            VidSnag respects the intellectual property rights of others and expects our users
                            to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and
                            will respond promptly to legitimate copyright infringement claims.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Important Notice</h2>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                            <p className="text-yellow-200 leading-relaxed">
                                <strong>VidSnag does not host any video content.</strong> We are a tool that helps
                                users download publicly available videos from third-party platforms. If you have
                                copyright concerns, please first contact the platform hosting the content
                                (YouTube, Instagram, TikTok, etc.).
                            </p>
                        </div>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Filing a DMCA Notice</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            If you believe your copyrighted work has been infringed through our service,
                            please provide the following information:
                        </p>
                        <ol className="text-gray-300 space-y-3 list-decimal list-inside">
                            <li>Identification of the copyrighted work claimed to have been infringed</li>
                            <li>Identification of the material that is claimed to be infringing</li>
                            <li>Your contact information (name, address, email, phone number)</li>
                            <li>A statement that you have a good faith belief that the use is not authorized</li>
                            <li>A statement, under penalty of perjury, that the information is accurate</li>
                            <li>Your physical or electronic signature</li>
                        </ol>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Counter-Notification</h2>
                        <p className="text-gray-300 leading-relaxed">
                            If you believe your content was wrongly removed, you may file a counter-notification
                            containing:
                        </p>
                        <ul className="text-gray-300 space-y-2 list-disc list-inside mt-4">
                            <li>Your physical or electronic signature</li>
                            <li>Identification of the material that was removed</li>
                            <li>A statement under penalty of perjury that removal was a mistake</li>
                            <li>Your name, address, and telephone number</li>
                            <li>Consent to jurisdiction of your local federal court</li>
                        </ul>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Submit a Claim</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Send DMCA notices to our designated agent:
                        </p>
                        <div className="bg-white/5 rounded-xl p-6">
                            <p className="text-gray-300">
                                <strong className="text-white">Email:</strong> dmca@vidsnag.com<br />
                                <strong className="text-white">Subject:</strong> DMCA Takedown Request
                            </p>
                        </div>
                        <p className="text-gray-400 text-sm mt-4">
                            We aim to respond to all valid DMCA requests within 48 hours.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Repeat Infringers</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We reserve the right to terminate access for users who repeatedly infringe
                            copyrights or violate our terms of service.
                        </p>
                    </section>
                </div>

                {/* Footer Links */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-400">
                    <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>
            </div>
        </main>
    );
}
