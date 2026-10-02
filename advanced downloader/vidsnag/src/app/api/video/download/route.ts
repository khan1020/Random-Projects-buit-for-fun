import { NextRequest, NextResponse } from "next/server";

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
        const { url, quality, format } = body;

        // Validate inputs
        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        if (!quality || !format) {
            return NextResponse.json(
                { error: "Quality and format are required" },
                { status: 400 }
            );
        }

        // In production, this would:
        // 1. Call yt-dlp to download the video
        // 2. Store it temporarily on S3 or local storage
        // 3. Return a signed download URL

        // For demo, simulate processing and return a placeholder
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate a mock download URL
        // In production, this would be a real signed URL to the downloaded file
        const downloadUrl = `data:text/plain;base64,${btoa("Demo download - integrate yt-dlp for real downloads")}`;

        return NextResponse.json(
            {
                success: true,
                downloadUrl,
                message: "Download ready",
                quality,
                format
            },
            {
                headers: { "X-RateLimit-Remaining": String(remaining) }
            }
        );
    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json(
            { error: "Failed to process download" },
            { status: 500 }
        );
    }
}
