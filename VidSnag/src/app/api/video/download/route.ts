import { NextRequest, NextResponse } from "next/server";
import { create } from "youtube-dl-exec";

// Use system-installed yt-dlp
// Use custom binary path
import * as path from "path";
import * as fs from "fs";

// Robust path resolution for Vercel
const getBinaryPath = () => {
    // 1. Try local project bin (works in dev)
    const localBin = path.join(process.cwd(), 'bin', 'yt-dlp');
    if (fs.existsSync(localBin)) return localBin;

    // 2. Try Vercel's lambda path
    const lambdaBin = path.join(process.cwd(), '..', 'bin', 'yt-dlp');
    if (fs.existsSync(lambdaBin)) return lambdaBin;

    // 3. Fallback to just 'yt-dlp' if in PATH
    return 'yt-dlp';
};

// Robust cookie path resolution (with copy to temp for write access)
const getCookiesPath = () => {
    try {
        // 1. Identify source path
        let sourcePath = path.join(process.cwd(), 'youtube_cookies.txt');
        if (!fs.existsSync(sourcePath)) {
            sourcePath = path.join(process.cwd(), '..', 'youtube_cookies.txt');
        }

        if (!fs.existsSync(sourcePath)) return undefined;

        // 2. Define temp path (writable)
        const tempKey = `cookies_${Date.now()}.txt`;
        const tempPath = path.join('/tmp', tempKey);

        // 3. Copy file to temp
        try {
            const data = fs.readFileSync(sourcePath);
            fs.writeFileSync(tempPath, data);
            return tempPath;
        } catch (copyError) {
            console.error("Error copy cookies to temp:", copyError);
            return sourcePath;
        }
    } catch (e) {
        return undefined;
    }
};

const binaryPath = getBinaryPath();
const youtubedl = create(binaryPath);

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_DOWNLOADS = 10; // 10 downloads per hour

function getRateLimitKey(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return { allowed: true, remaining: MAX_DOWNLOADS - 1 };
    }

    if (record.count >= MAX_DOWNLOADS) {
        return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: MAX_DOWNLOADS - record.count };
}

// Quality to height mapping
const qualityToHeight: Record<string, number> = {
    "4K": 2160,
    "1440p": 1440,
    "1080p": 1080,
    "720p": 720,
    "480p": 480,
    "360p": 360,
    "240p": 240,
};

export async function POST(request: NextRequest) {
    try {
        // Rate limiting check
        const rateLimitKey = getRateLimitKey(request);
        const { allowed, remaining } = checkRateLimit(rateLimitKey);

        if (!allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please try again later." },
                {
                    status: 429,
                    headers: { "X-RateLimit-Remaining": "0" }
                }
            );
        }

        const body = await request.json();
        const { url, quality } = body;

        // Validate inputs
        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        if (!quality) {
            return NextResponse.json(
                { error: "Quality is required" },
                { status: 400 }
            );
        }

        // Build format selector for yt-dlp
        // Use 'best' format which has video+audio combined (works with direct download)
        let formatSelector: string;

        if (quality === "Audio") {
            // Audio only
            formatSelector = "bestaudio[ext=m4a]/bestaudio";
        } else {
            const height = qualityToHeight[quality] || 720;
            // Use formats with both video AND audio (avoids the 2-URL issue)
            // Fallback chain: best combined format at or below requested height
            formatSelector = `best[height<=${height}]/best`;
        }

        // Get the direct download URL using yt-dlp
        const cookiesPath = getCookiesPath();
        const result = await youtubedl(url, {
            getUrl: true,
            format: formatSelector,
            noCheckCertificates: true,
            noWarnings: true,
            noPlaylist: true,
            cookies: cookiesPath,
        });

        // The result should be the direct URL as a string
        const resultOutput = result as unknown;
        let downloadUrl = typeof resultOutput === 'string' ? resultOutput.trim() : String(resultOutput).trim();

        // If we got multiple URLs (video + audio separated by newline), take only the first
        if (downloadUrl.includes('\n')) {
            downloadUrl = downloadUrl.split('\n')[0].trim();
        }

        if (!downloadUrl || downloadUrl.length < 10 || !downloadUrl.startsWith('http')) {
            throw new Error("Failed to get download URL");
        }

        return NextResponse.json(
            {
                success: true,
                downloadUrl,
                message: "Download ready",
                quality,
            },
            {
                headers: { "X-RateLimit-Remaining": String(remaining) }
            }
        );
    } catch (error: any) {
        console.error("Download error:", error);
        console.error("Error stderr:", error.stderr);
        return NextResponse.json(
            { error: error.stderr || error.message || "Failed to process download" },
            { status: 500 }
        );
    }
}
