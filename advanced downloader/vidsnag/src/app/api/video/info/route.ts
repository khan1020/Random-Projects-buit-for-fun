import { NextRequest, NextResponse } from "next/server";
import youtubedl from "youtube-dl-exec";

interface VideoInfo {
    title: string;
    thumbnail: string;
    duration: string;
    views: string;
    author: string;
    platform: string;
    formats: { quality: string; format: string; size: string; hasAudio: boolean }[];
}

function detectPlatform(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
    if (lower.includes("instagram.com")) return "Instagram";
    if (lower.includes("tiktok.com")) return "TikTok";
    if (lower.includes("facebook.com") || lower.includes("fb.watch")) return "Facebook";
    if (lower.includes("twitter.com") || lower.includes("x.com")) return "Twitter";
    if (lower.includes("reddit.com")) return "Reddit";
    if (lower.includes("vimeo.com")) return "Vimeo";
    return "Other";
}

function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

function formatDuration(seconds: number): string {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
    if (!bytes) return "Unknown";
    const mb = bytes / (1024 * 1024);
    const gb = bytes / (1024 * 1024 * 1024);

    if (gb >= 1) {
        return `${gb.toFixed(2)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
}

function formatViews(viewCount: number): string {
    if (!viewCount) return "Unknown";
    if (viewCount >= 1000000) {
        return `${(viewCount / 1000000).toFixed(1)}M views`;
    }
    if (viewCount >= 1000) {
        return `${(viewCount / 1000).toFixed(1)}K views`;
    }
    return `${viewCount} views`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url } = body;

        // Validate URL
        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        if (!isValidUrl(url)) {
            return NextResponse.json(
                { error: "Invalid URL format" },
                { status: 400 }
            );
        }

        // Fetch video info using yt-dlp
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        // Extract formats
        const formats: VideoInfo["formats"] = [];
        const processedQualities = new Set<string>();

        // Get available formats
        if (info.formats && Array.isArray(info.formats)) {
            // Sort formats by quality (best first)
            const sortedFormats = info.formats
                .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none') // Has both video and audio
                .sort((a: any, b: any) => (b.filesize || 0) - (a.filesize || 0));

            // Common quality labels
            const qualityMap: Record<number, string> = {
                2160: "4K",
                1440: "1440p",
                1080: "1080p",
                720: "720p",
                480: "480p",
                360: "360p",
                240: "240p",
            };

            for (const format of sortedFormats) {
                if (!format.height) continue;

                const quality = qualityMap[format.height] || `${format.height}p`;

                if (processedQualities.has(quality)) continue;
                processedQualities.add(quality);

                formats.push({
                    quality,
                    format: format.ext || "mp4",
                    size: formatFileSize(format.filesize || format.filesize_approx || 0),
                    hasAudio: format.acodec !== 'none',
                });
            }

            // Add audio-only format
            const audioFormat = info.formats.find((f: any) => f.vcodec === 'none' && f.acodec !== 'none');
            if (audioFormat) {
                formats.push({
                    quality: "Audio",
                    format: "mp3",
                    size: formatFileSize(audioFormat.filesize || audioFormat.filesize_approx || 0),
                    hasAudio: true,
                });
            }
        }

        // If no formats found, add default
        if (formats.length === 0) {
            formats.push({
                quality: "Best",
                format: "mp4",
                size: "Unknown",
                hasAudio: true,
            });
        }

        const videoInfo: VideoInfo = {
            title: info.title || "Unknown Title",
            thumbnail: info.thumbnail || "https://picsum.photos/640/360",
            duration: formatDuration(info.duration || 0),
            views: formatViews(info.view_count || 0),
            author: info.uploader || info.channel || "Unknown",
            platform: detectPlatform(url),
            formats,
        };

        return NextResponse.json(videoInfo);
    } catch (error: any) {
        console.error("Video info error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch video information" },
            { status: 500 }
        );
    }
}
