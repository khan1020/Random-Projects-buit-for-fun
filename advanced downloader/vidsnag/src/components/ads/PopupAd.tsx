"use client";

import { useState, useEffect } from "react";

interface PopupAdProps {
    onClose: () => void;
    duration?: number; // Duration in seconds
}

export default function PopupAd({ onClose, duration = 10 }: PopupAdProps) {
    const [countdown, setCountdown] = useState(duration);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanClose(true);
        }
    }, [countdown]);

    return (
        <div className="popup-overlay" role="dialog" aria-modal="true">
            <div className="popup-content max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Sponsored
                    </span>

                    {canClose ? (
                        <button
                            onClick={onClose}
                            className="popup-close"
                            aria-label="Close ad"
                        >
                            ✕
                        </button>
                    ) : (
                        <div className="popup-timer">
                            {countdown}s
                        </div>
                    )}
                </div>

                {/* Ad Content */}
                <div className="mb-4">
                    {process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
                        <ins
                            className="adsbygoogle"
                            style={{ display: "block", width: "100%", height: 250 }}
                            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
                            data-ad-slot="popup-ad"
                            data-ad-format="rectangle"
                        />
                    ) : (
                        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-8 text-center">
                            <div className="text-4xl mb-4">🎬</div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Thanks for using VidSnag!
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                This ad helps keep VidSnag free for everyone.
                            </p>
                            <div className="text-2xl">❤️</div>
                        </div>
                    )}
                </div>

                {/* Skip Button */}
                {canClose && (
                    <button
                        onClick={onClose}
                        className="btn-gradient w-full"
                    >
                        <span>Continue Downloading</span>
                    </button>
                )}

                {!canClose && (
                    <p className="text-center text-gray-500 text-sm">
                        Ad closes in {countdown} seconds...
                    </p>
                )}
            </div>
        </div>
    );
}
