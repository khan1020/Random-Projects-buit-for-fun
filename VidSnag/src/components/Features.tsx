export default function Features() {
    const features = [
        {
            icon: "⚡",
            title: "Lightning Fast",
            description: "Download videos in seconds with our optimized servers.",
        },
        {
            icon: "🔒",
            title: "100% Safe & Secure",
            description: "No registration required. Your data stays private.",
        },
        {
            icon: "🎬",
            title: "HD & 4K Quality",
            description: "Download in the highest available quality - up to 4K.",
        },
        {
            icon: "🌐",
            title: "1000+ Sites",
            description: "YouTube, Instagram, TikTok, Facebook, and many more.",
        },
        {
            icon: "📱",
            title: "All Devices",
            description: "Works on desktop, tablet, or mobile. No app needed.",
        },
        {
            icon: "💰",
            title: "100% Free",
            description: "No hidden fees. All features are completely free.",
        },
    ];

    return (
        <section id="features" className="py-16 md:py-24 bg-black/30">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Why Choose <span className="logo-gradient">VidSnag</span>?
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        The most powerful and user-friendly video downloader on the web.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
