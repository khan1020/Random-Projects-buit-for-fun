"use client";

import Link from "next/link";

export default function TermsOfService() {
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
                        Terms of Service
                    </h1>
                    <p className="text-gray-400">Last updated: January 2024</p>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none space-y-8">
                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-300 leading-relaxed">
                            By accessing and using VidSnag (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our Service.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                        <p className="text-gray-300 leading-relaxed">
                            VidSnag provides a video downloading service that allows users to download publicly available
                            videos from various platforms for personal, non-commercial use only.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
                        <ul className="text-gray-300 space-y-3 list-disc list-inside">
                            <li>You are solely responsible for ensuring you have the legal right to download any content</li>
                            <li>You agree not to download copyrighted content without permission from the copyright holder</li>
                            <li>You will not use downloaded content for commercial purposes without proper authorization</li>
                            <li>You will comply with all applicable local, national, and international laws</li>
                            <li>You will not attempt to circumvent any security measures of the Service</li>
                        </ul>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
                        <p className="text-gray-300 leading-relaxed">
                            VidSnag does not claim ownership of any content downloaded through our service.
                            All videos and media remain the property of their respective owners. Users must respect
                            all intellectual property rights and only download content they are legally entitled to access.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Disclaimer of Warranties</h2>
                        <p className="text-gray-300 leading-relaxed">
                            The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind,
                            either express or implied. We do not guarantee that the Service will be uninterrupted,
                            secure, or error-free.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
                        <p className="text-gray-300 leading-relaxed">
                            VidSnag shall not be liable for any indirect, incidental, special, consequential, or
                            punitive damages arising from your use of the Service. Our total liability shall not
                            exceed the amount paid by you, if any, for accessing the Service.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to Terms</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We reserve the right to modify these Terms at any time. Changes will be effective
                            immediately upon posting. Your continued use of the Service after any changes
                            constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Contact</h2>
                        <p className="text-gray-300 leading-relaxed">
                            For questions about these Terms, please contact us at{" "}
                            <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                                our contact page
                            </Link>.
                        </p>
                    </section>
                </div>

                {/* Footer Links */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-400">
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>
            </div>
        </main>
    );
}
