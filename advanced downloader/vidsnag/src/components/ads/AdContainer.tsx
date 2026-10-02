"use client";

import { useEffect, useRef } from "react";

interface AdContainerProps {
    type: "sidebar" | "banner";
    slot: string;
}

export default function AdContainer({ type, slot }: AdContainerProps) {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only run AdSense if client ID is configured
        if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
            try {
                // @ts-expect-error - AdSense global
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (error) {
                console.error("AdSense error:", error);
            }
        }
    }, []);

    const adSizes = {
        sidebar: { width: 160, height: 600 },
        banner: { width: 728, height: 90 },
    };

    const size = adSizes[type];

    return (
        <div ref={adRef} className="ad-container">
            <div className="ad-label">Advertisement</div>

            {process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
                <ins
                    className="adsbygoogle"
                    style={{ display: "block", width: size.width, height: size.height }}
                    data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
                    data-ad-slot={slot}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            ) : (
                // Placeholder for development
                <div
                    className="bg-gray-800/50 rounded flex items-center justify-center text-gray-500 text-xs"
                    style={{ width: size.width, height: size.height, maxWidth: "100%" }}
                >
                    {type === "sidebar" ? "160x600" : "728x90"} Ad Space
                </div>
            )}
        </div>
    );
}
