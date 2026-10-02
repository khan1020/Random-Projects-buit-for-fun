import { NextRequest, NextResponse } from "next/server";
import { spawn, ChildProcess, exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

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

// Store for tracking download progress
interface DownloadInfo {
    status: string;
    progress: number;
    speed: string;
    eta: string;
    stage: string;
    filePath?: string;
    error?: string;
    process?: ChildProcess;
    outputPath?: string;
    pid?: number;  // Store PID separately for reliability
}

// Use globalThis to persist across Next.js module reloads
declare global {
    // eslint-disable-next-line no-var
    var downloadProgressMap: Map<string, DownloadInfo> | undefined;
}

// Create or reuse the global Map
const downloadProgress = globalThis.downloadProgressMap || new Map<string, DownloadInfo>();
globalThis.downloadProgressMap = downloadProgress;

// Auto-cleanup stale downloads (older than 30 minutes)
const STALE_THRESHOLD_MS = 30 * 60 * 1000;
const MAX_CONCURRENT_DOWNLOADS = 3;

function cleanupStaleDownloads() {
    const now = Date.now();
    for (const [id, info] of downloadProgress.entries()) {
        // Extract timestamp from download ID
        const match = id.match(/dl_(\d+)_/);
        if (match) {
            const timestamp = parseInt(match[1]);
            if (now - timestamp > STALE_THRESHOLD_MS) {
                // Kill process if still running
                if (info.process && !info.process.killed) {
                    try { info.process.kill(); } catch (e) { /* ignore */ }
                }
                // Delete temp files
                if (info.outputPath && fs.existsSync(info.outputPath)) {
                    try { fs.unlinkSync(info.outputPath); } catch (e) { /* ignore */ }
                }
                downloadProgress.delete(id);
            }
        }
    }
}

export async function GET(request: NextRequest) {
    // Run cleanup on each request (lightweight check)
    cleanupStaleDownloads();

    const { searchParams } = new URL(request.url);
    const downloadId = searchParams.get("id");
    const action = searchParams.get("action");

    // If checking status
    if (action === "status" && downloadId) {
        const progress = downloadProgress.get(downloadId);
        if (!progress) {
            return NextResponse.json({ error: "Download not found" }, { status: 404 });
        }
        // Return only safe fields
        return NextResponse.json({
            status: progress.status,
            progress: progress.progress,
            speed: progress.speed,
            eta: progress.eta,
            stage: progress.stage,
            error: progress.error,
        });
    }

    // If cancelling the download
    if (action === "cancel" && downloadId) {
        const progress = downloadProgress.get(downloadId);
        if (!progress) {
            return NextResponse.json({ error: "Download not found" }, { status: 404 });
        }

        // Mark as cancelled immediately
        progress.status = "cancelled";

        // Kill ALL yt-dlp and ffmpeg processes
        exec('taskkill /IM yt-dlp.exe /F 2>nul', () => { });
        exec('taskkill /IM ffmpeg.exe /F 2>nul', () => { });

        // Also try to kill via process object
        if (progress.process && !progress.process.killed) {
            try { progress.process.kill(); } catch (e) { /* ignore */ }
        }

        // Clean up temp files after a delay
        if (progress.outputPath) {
            setTimeout(() => {
                try {
                    const dir = path.dirname(progress.outputPath!);
                    const base = path.basename(progress.outputPath!, path.extname(progress.outputPath!));
                    const files = fs.readdirSync(dir);
                    files.forEach(file => {
                        if (file.startsWith(base)) {
                            try { fs.unlinkSync(path.join(dir, file)); } catch (e) { /* ignore */ }
                        }
                    });
                } catch (e) { /* ignore */ }
            }, 500);
        }

        downloadProgress.delete(downloadId);
        return NextResponse.json({ success: true, message: "Download cancelled" });
    }

    // If downloading the file - use streaming for better memory efficiency
    if (action === "download" && downloadId) {
        const progress = downloadProgress.get(downloadId);
        if (!progress || progress.status !== "complete" || !progress.filePath) {
            return NextResponse.json({ error: "File not ready" }, { status: 400 });
        }

        try {
            const filePath = progress.filePath;
            const stat = fs.statSync(filePath);
            const filename = path.basename(filePath);

            // Use streaming instead of loading entire file into memory
            const stream = fs.createReadStream(filePath);

            // Schedule cleanup after stream ends
            stream.on('close', () => {
                try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
                downloadProgress.delete(downloadId);
            });

            // @ts-ignore - NextResponse can accept ReadableStream
            return new NextResponse(stream as any, {
                status: 200,
                headers: {
                    "Content-Type": "video/mp4",
                    "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
                    "Content-Length": String(stat.size),
                },
            });
        } catch (error) {
            return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, quality, title } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        const downloadId = `dl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const tempDir = os.tmpdir();
        const height = qualityToHeight[quality] || 720;

        // Clean the title for filename
        const cleanTitle = (title || "video")
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 80);

        const ext = quality === "Audio" ? "m4a" : "mp4";
        const filename = `${cleanTitle}_${quality}.${ext}`;
        const outputPath = path.join(tempDir, `vidsnag_${downloadId}.${ext}`);

        // Initialize progress
        downloadProgress.set(downloadId, {
            status: "starting",
            progress: 0,
            speed: "",
            eta: "",
            stage: "Initializing...",
        });

        // Start download in background
        startDownload(downloadId, url, quality, height, outputPath, filename);

        return NextResponse.json({
            success: true,
            downloadId,
            message: "Download started",
        });

    } catch (error: any) {
        console.error("Start download error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to start download" },
            { status: 500 }
        );
    }
}

async function startDownload(
    downloadId: string,
    url: string,
    quality: string,
    height: number,
    outputPath: string,
    filename: string
) {
    try {
        // Build yt-dlp command arguments
        let formatSelector: string;
        if (quality === "Audio") {
            formatSelector = "bestaudio[ext=m4a]/bestaudio";
        } else {
            // Get best video at or below the requested height + best audio, merged
            formatSelector = `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`;
        }

        const args = [
            "-f", formatSelector,
            "--merge-output-format", "mp4",
            "--no-playlist",
            "--progress",
            "--newline",
            // Speed optimizations
            "--concurrent-fragments", "4",     // Download 4 fragments concurrently
            "--no-check-certificates",          // Skip SSL verification
            "--no-warnings",                    // Suppress warnings
            "--extractor-retries", "3",         // Retry failed extracts
            "--fragment-retries", "3",          // Retry failed fragments
            "-o", outputPath,
            url
        ];

        // Check concurrent download limit
        const activeDownloads = Array.from(downloadProgress.values())
            .filter(d => d.status === "downloading" || d.status === "merging")
            .length;

        if (activeDownloads >= MAX_CONCURRENT_DOWNLOADS) {
            const prog = downloadProgress.get(downloadId);
            if (prog) {
                prog.status = "error";
                prog.error = "Too many concurrent downloads. Please wait for one to finish.";
            }
            return;
        }

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

        const cookiesPath = getCookiesPath();
        if (cookiesPath) {
            args.push("--cookies", cookiesPath);
            console.log(`[VidSnag] Using cookies from: ${cookiesPath}`);
        } else {
            console.log("[VidSnag] Warning: No cookies file found");
        }

        // Robust path resolution for Vercel
        const getBinaryPath = () => {
            const localBin = path.join(process.cwd(), 'bin', 'yt-dlp');
            if (fs.existsSync(localBin)) return localBin;

            const lambdaBin = path.join(process.cwd(), '..', 'bin', 'yt-dlp');
            if (fs.existsSync(lambdaBin)) return lambdaBin;

            return 'yt-dlp';
        };

        const binaryPath = getBinaryPath();
        console.log(`[VidSnag] Spawning yt-dlp from: ${binaryPath}`);
        const ytdlp = spawn(binaryPath, args);
        console.log(`[VidSnag] yt-dlp spawned with PID: ${ytdlp.pid}`);
        let lastProgress = 0;

        // Store process reference and PID for cancellation
        const currentProgress = downloadProgress.get(downloadId);
        if (currentProgress) {
            currentProgress.process = ytdlp;
            currentProgress.outputPath = outputPath;
            currentProgress.pid = ytdlp.pid;
            // Update status immediately so UI shows downloading
            currentProgress.status = "downloading";
            currentProgress.stage = "Starting download...";
        }

        ytdlp.stdout.on("data", (data: Buffer) => {
            const output = data.toString();

            // Check if download was cancelled - kill process immediately
            const prog = downloadProgress.get(downloadId);
            if (!prog || prog.status === "cancelled") {
                try {
                    ytdlp.kill();
                    exec(`taskkill /IM yt-dlp.exe /F 2>nul`);
                } catch (e) { /* ignore */ }
                return;
            }

            // Parse progress from yt-dlp output
            const progressMatch = output.match(/\[download\]\s+([\d.]+)%\s+of\s+~?([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+([\d:]+)/);
            if (progressMatch) {
                const progress = parseFloat(progressMatch[1]);
                const speed = progressMatch[3];
                const eta = progressMatch[4];

                if (progress > lastProgress) {
                    lastProgress = progress;
                    if (prog) {
                        prog.status = "downloading";
                        prog.progress = Math.round(progress);
                        prog.speed = speed;
                        prog.eta = eta;
                        prog.stage = "Downloading video...";
                    }
                }
            }

            // Check for merging stage
            if (output.includes("[Merger]") || output.includes("Merging")) {
                const prog = downloadProgress.get(downloadId);
                if (prog) {
                    prog.status = "merging";
                    prog.progress = 95;
                    prog.speed = "";
                    prog.eta = "";
                    prog.stage = "Merging video and audio...";
                }
            }

            // Check for download completion
            if (output.includes("100%") || output.includes("has already been downloaded")) {
                const prog = downloadProgress.get(downloadId);
                if (prog) {
                    prog.status = "processing";
                    prog.progress = 90;
                    prog.stage = "Processing...";
                }
            }
        });

        ytdlp.stderr.on("data", (data: Buffer) => {
            const output = data.toString();

            // Also check stderr for progress
            if (output.includes("[download]")) {
                const progressMatch = output.match(/([\d.]+)%/);
                if (progressMatch) {
                    const progress = parseFloat(progressMatch[1]);
                    if (progress > lastProgress) {
                        lastProgress = progress;
                        const prog = downloadProgress.get(downloadId);
                        if (prog) {
                            prog.progress = Math.round(progress);
                        }
                    }
                }
            }
        });

        ytdlp.on("close", (code: number | null) => {
            const prog = downloadProgress.get(downloadId);
            if (prog) {
                if (code === 0 && fs.existsSync(outputPath)) {
                    prog.status = "complete";
                    prog.progress = 100;
                    prog.speed = "";
                    prog.eta = "";
                    prog.stage = "Complete!";
                    prog.filePath = outputPath;
                } else {
                    prog.status = "error";
                    prog.progress = 0;
                    prog.stage = "Download failed";
                    prog.error = `Exit code: ${code}`;
                }
            }
        });

        ytdlp.on("error", (error: Error) => {
            console.error("yt-dlp error:", error);
            const prog = downloadProgress.get(downloadId);
            if (prog) {
                prog.status = "error";
                prog.progress = 0;
                prog.stage = "Download failed";
                prog.error = error.message;
            }
        });

    } catch (error: any) {
        console.error("Download error:", error);
        const prog = downloadProgress.get(downloadId);
        if (prog) {
            prog.status = "error";
            prog.progress = 0;
            prog.stage = "Download failed";
            prog.error = error.message;
        }
    }
}

