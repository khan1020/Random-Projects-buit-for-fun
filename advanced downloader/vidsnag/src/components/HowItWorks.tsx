export default function HowItWorks() {
    const steps = [
        {
            number: "1",
            title: "Paste the Link",
            description: "Copy the video URL from YouTube, Instagram, TikTok, or any supported platform and paste it in the input box.",
        },
        {
            number: "2",
            title: "Choose Quality",
            description: "Select your preferred video quality from the available options - from 360p to 4K.",
        },
        {
            number: "3",
            title: "Download",
            description: "Click the download button and save the video directly to your device. That's it!",
        },
    ];

    return (
        <section id="how-it-works" className="py-16 md:py-24">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        How It <span className="logo-gradient">Works</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Download any video in just 3 simple steps. No signup, no software installation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative text-center">
                            {/* Connector line for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30" />
                            )}

                            {/* Step number */}
                            <div className="relative z-10 w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">{step.number}</span>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-400 text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
