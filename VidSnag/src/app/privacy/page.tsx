"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
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
                        Privacy Policy
                    </h1>
                    <p className="text-gray-400">Last updated: January 2024</p>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none space-y-8">
                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            VidSnag is designed with privacy in mind. We collect minimal information:
                        </p>
                        <ul className="text-gray-300 space-y-2 list-disc list-inside">
                            <li><strong>URLs:</strong> Video URLs you submit (processed temporarily, not stored)</li>
                            <li><strong>Usage Data:</strong> Anonymous analytics (page views, download counts)</li>
                            <li><strong>Cookies:</strong> Essential cookies for functionality only</li>
                        </ul>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. What We Don&apos;t Collect</h2>
                        <ul className="text-gray-300 space-y-2 list-disc list-inside">
                            <li>Personal identification information (name, email, phone)</li>
                            <li>Account credentials or login information</li>
                            <li>Downloaded video content (videos are streamed directly to you)</li>
                            <li>Browsing history beyond our site</li>
                            <li>Location data</li>
                        </ul>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Information</h2>
                        <p className="text-gray-300 leading-relaxed">
                            The minimal data we collect is used solely to:
                        </p>
                        <ul className="text-gray-300 space-y-2 list-disc list-inside mt-4">
                            <li>Process your video download requests</li>
                            <li>Improve our service and user experience</li>
                            <li>Monitor and prevent abuse of our service</li>
                            <li>Display relevant advertisements</li>
                        </ul>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Services</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We may use third-party services that collect information:
                        </p>
                        <ul className="text-gray-300 space-y-2 list-disc list-inside mt-4">
                            <li><strong>Google Analytics:</strong> For anonymous usage statistics</li>
                            <li><strong>Google AdSense:</strong> For displaying advertisements</li>
                            <li><strong>Cloudflare:</strong> For security and performance</li>
                        </ul>
                        <p className="text-gray-300 mt-4">
                            These services have their own privacy policies that govern their data collection practices.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We use essential cookies to ensure our website functions properly. Third-party services
                            may also set cookies for analytics and advertising purposes. You can control cookie
                            preferences through your browser settings.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Data Security</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We implement appropriate security measures to protect against unauthorized access,
                            alteration, or destruction of data. However, no method of transmission over the
                            Internet is 100% secure.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Children&apos;s Privacy</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Our Service is not intended for children under 13. We do not knowingly collect
                            information from children under 13. If you believe we have collected such information,
                            please contact us immediately.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Your Rights</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Since we don&apos;t collect personal data, there&apos;s typically nothing to delete or export.
                            If you have concerns, please{" "}
                            <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                                contact us
                            </Link>.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes
                            by posting the new policy on this page with an updated date.
                        </p>
                    </section>
                </div>

                {/* Footer Links */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-400">
                    <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>
            </div>
        </main>
    );
}
