"use client";

import { useState, useCallback, useEffect, FormEvent, useRef } from "react";

interface VideoInfo {
    title: string;
    thumbnail: string;
    duration: string;
    views: string;
    author: string;
    platform: string;
    formats: VideoFormat[];
}

interface VideoFormat {
    quality: string;
    format: string;
    size: string;
    hasAudio: boolean;
}

interface VideoDownloaderProps {
    onDownloadComplete?: () => void;
}

interface DownloadStatus {
    status: string;
    progress: number;
    speed: string;
    eta: string;
    stage: string;
    error?: string;
}

export default function VideoDownloader({ onDownloadComplete }: VideoDownloaderProps) {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [currentDownloadId, setCurrentDownloadId] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const detectPlatform = (inputUrl: string): string => {
        const lower = inputUrl.toLowerCase();
        if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
        if (lower.includes("instagram.com")) return "Instagram";
        if (lower.includes("tiktok.com")) return "TikTok";
        if (lower.includes("facebook.com") || lower.includes("fb.watch")) return "Facebook";
        if (lower.includes("twitter.com") || lower.includes("x.com")) return "Twitter";
        if (lower.includes("reddit.com")) return "Reddit";
        if (lower.includes("vimeo.com")) return "Vimeo";
        return "Unknown";
    };

    const isValidUrl = (string: string): boolean => {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    };

    const fetchVideoInfo = useCallback(async (videoUrl: string) => {
        setError(null);
        setVideoInfo(null);
        setSelectedFormat(null);
        setDownloadProgress(null);
        setIsLoading(true);

        try {
            const response = await fetch("/api/video/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: videoUrl }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to fetch video info");
            }

            const data = await response.json();
            setVideoInfo(data);
            if (data.formats && data.formats.length > 0) {
                setSelectedFormat(data.formats[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch video information");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-fetch when URL is pasted (with debouncing)
    useEffect(() => {
        if (!url.trim() || !isValidUrl(url)) return;

        const timer = setTimeout(() => {
            fetchVideoInfo(url);
        }, 800); // Reduced from 1000ms for faster response

        return () => clearTimeout(timer);
    }, [url, fetchVideoInfo]);

    // Cleanup polling interval on unmount ONLY
    useEffect(() => {
        // Store ref to download ID at effect creation time
        const downloadIdAtMount = currentDownloadId;

        return () => {
            // Only cleanup polling on unmount
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, []); // Empty deps = only runs on mount/unmount

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setVideoInfo(null);
        setSelectedFormat(null);
        setDownloadProgress(null);

        if (!url.trim()) {
            setError("Please enter a video URL");
            return;
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            setError("Please enter a valid URL");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/video/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to fetch video info");
            }

            const data = await response.json();
            setVideoInfo(data);
            if (data.formats && data.formats.length > 0) {
                setSelectedFormat(data.formats[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch video information");
        } finally {
            setIsLoading(false);
        }
    }, [url]);

    const handleDownload = useCallback(async () => {
        if (!videoInfo || !selectedFormat) return;

        setDownloadProgress(0);
        setDownloadStatus(null);
        setIsDownloading(true);
        setError(null);

        try {
            // Start the download on the server
            const response = await fetch("/api/video/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url,
                    quality: selectedFormat.quality,
                    title: videoInfo.title,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to start download");
            }

            const { downloadId } = await response.json();
            setCurrentDownloadId(downloadId);

            // Poll for progress
            pollIntervalRef.current = setInterval(async () => {
                try {
                    const statusResponse = await fetch(
                        `/api/video/stream?action=status&id=${downloadId}`
                    );

                    if (!statusResponse.ok) {
                        throw new Error("Failed to get status");
                    }

                    const status: DownloadStatus = await statusResponse.json();
                    setDownloadStatus(status);
                    setDownloadProgress(status.progress);

                    if (status.status === "complete") {
                        // Stop polling
                        if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                            pollIntervalRef.current = null;
                        }

                        // Trigger file download
                        window.location.href = `/api/video/stream?action=download&id=${downloadId}`;

                        setIsDownloading(false);
                        setCurrentDownloadId(null);
                        onDownloadComplete?.();

                        // Reset after success
                        setTimeout(() => {
                            setDownloadProgress(null);
                            setDownloadStatus(null);
                        }, 3000);
                    } else if (status.status === "error") {
                        // Stop polling
                        if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                            pollIntervalRef.current = null;
                        }
                        setError(status.error || "Download failed");
                        setIsDownloading(false);
                        setCurrentDownloadId(null);
                        setDownloadProgress(null);
                        setDownloadStatus(null);
                    }
                } catch (pollError) {
                    console.error("Poll error:", pollError);
                }
            }, 1000);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Download failed");
            setDownloadProgress(null);
            setDownloadStatus(null);
            setIsDownloading(false);
            setCurrentDownloadId(null);
        }
    }, [url, videoInfo, selectedFormat, onDownloadComplete]);

    const handleCancel = useCallback(async () => {
        if (!currentDownloadId) return;

        // Stop polling
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        try {
            await fetch(`/api/video/stream?action=cancel&id=${currentDownloadId}`);
        } catch (e) {
            console.error("Cancel error:", e);
        }

        setIsDownloading(false);
        setDownloadProgress(null);
        setDownloadStatus(null);
        setCurrentDownloadId(null);
    }, [currentDownloadId]);

    const handleReset = () => {
        // Cancel any active download first
        if (isDownloading && currentDownloadId) {
            handleCancel();
        }
        setUrl("");
        setVideoInfo(null);
        setSelectedFormat(null);
        setError(null);
        setDownloadProgress(null);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="relative flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        {/* Platform Icon */}
                        {url && (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <PlatformIcon platform={detectPlatform(url)} />
                            </div>
                        )}
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste video link here..."
                            className={`input-glass w-full ${url ? 'pl-12' : ''}`}
                            disabled={isLoading}
                            aria-label="Video URL"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !url.trim()}
                        className="btn-gradient flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner" />
                                <span>Fetching...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Get Video</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-400 hover:text-red-300"
                        aria-label="Dismiss error"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Video Preview */}
            {videoInfo && (
                <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Thumbnail */}
                        <div className="relative w-full md:w-72 flex-shrink-0">
                            <div className="aspect-video rounded-xl overflow-hidden bg-gray-800">
                                <img
                                    src={videoInfo.thumbnail}
                                    alt={videoInfo.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Duration badge */}
                            {videoInfo.duration && (
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                    {videoInfo.duration}
                                </span>
                            )}
                            {/* Platform badge */}
                            <span className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <PlatformIcon platform={videoInfo.platform} size={14} />
                                {videoInfo.platform}
                            </span>
                        </div>

                        {/* Info & Controls */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                {videoInfo.title}
                            </h2>
                            <p className="text-gray-400 text-sm mb-1">{videoInfo.author}</p>
                            <p className="text-gray-500 text-sm mb-4">{videoInfo.views}</p>

                            {/* Quality Selection */}
                            <div className="mb-4">
                                <p className="text-gray-400 text-sm mb-2">Select Quality:</p>
                                <div className="flex flex-wrap gap-2">
                                    {videoInfo.formats.map((format, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedFormat(format)}
                                            className={`quality-badge ${selectedFormat?.quality === format.quality && selectedFormat?.format === format.format
                                                ? "selected"
                                                : ""
                                                }`}
                                        >
                                            <span className="font-medium text-sm">{format.quality}</span>
                                            <span className="text-xs text-gray-400 ml-1">
                                                ({format.format.toUpperCase()})
                                            </span>
                                            {format.size && (
                                                <span className="text-xs text-gray-500 ml-1">• {format.size}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Download Button */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={!selectedFormat || isDownloading}
                                    className="btn-gradient pulse-glow flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDownloading ? (
                                        <>
                                            <span className="spinner" />
                                            <span>
                                                {downloadStatus?.stage || "Preparing..."}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span>Download</span>
                                        </>
                                    )}
                                </button>
                                {/* Cancel Button - only visible when downloading */}
                                {isDownloading && (
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-colors"
                                        aria-label="Cancel Download"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 rounded-full border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                                    aria-label="Reset"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Progress Bar */}
                            {downloadProgress !== null && (
                                <div className="mt-4">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    </div>
                                    {downloadStatus && (
                                        <div className="mt-2 text-sm text-gray-400 flex justify-between items-center">
                                            <span>{downloadStatus.stage}</span>
                                            <div className="flex gap-4">
                                                {downloadStatus.speed && (
                                                    <span className="text-cyan-400">{downloadStatus.speed}</span>
                                                )}
                                                {downloadStatus.eta && (
                                                    <span>ETA: {downloadStatus.eta}</span>
                                                )}
                                                <span className="text-white font-medium">{downloadStatus.progress}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Platform Icon Component
function PlatformIcon({ platform, size = 20 }: { platform: string; size?: number }) {
    const iconStyle = { width: size, height: size };

    switch (platform.toLowerCase()) {
        case "youtube":
            return (
                <svg style={iconStyle} viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            );
        case "instagram":
            return (
                <svg style={iconStyle} viewBox="0 0 24 24" fill="#E4405F">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
            );
        case "tiktok":
            return (
                <svg style={iconStyle} viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
            );
        case "facebook":
            return (
                <svg style={iconStyle} viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            );
        case "twitter":
            return (
                <svg style={iconStyle} viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        default:
            return (
                <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
            );
    }
}
