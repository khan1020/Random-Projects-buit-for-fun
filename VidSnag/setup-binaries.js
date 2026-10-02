const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const binDir = path.join(process.cwd(), 'bin');
const ytDlpPath = path.join(binDir, 'yt-dlp');

// Create bin directory if it doesn't exist
if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
}

// URL for the latest yt-dlp binary (Linux versionStandalone for Vercel)
// We use 'yt-dlp_linux' which has Python embedded, as Vercel doesn't have Python installed
const BINARY_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';

console.log('Setup: Checking for yt-dlp binary...');

if (fs.existsSync(ytDlpPath)) {
    console.log('Setup: yt-dlp binary already exists.');
} else {
    console.log('Setup: Downloading yt-dlp binary from GitHub...');
    downloadFile(BINARY_URL, ytDlpPath);
}

function downloadFile(url, destPath) {
    // If recursively called, we might need to recreate the stream if it was closed? 
    // Actually, createWriteStream overwrites.

    const request = https.get(url, (response) => {
        // Handle Redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
            console.log(`Setup: Redirecting to ${response.headers.location}...`);
            // Recursively call with new URL
            return downloadFile(response.headers.location, destPath);
        }

        if (response.statusCode !== 200) {
            console.error(`Setup: Failed to download binary. Status code: ${response.statusCode}`);
            // Clean up empty file
            fs.unlink(destPath, () => { });
            process.exit(1);
        }

        const file = fs.createWriteStream(destPath);
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log('Setup: Download complete.');

            // Make executable
            try {
                if (process.platform !== 'win32') {
                    execSync(`chmod +x ${destPath}`);
                    console.log('Setup: Made binary executable.');
                }
            } catch (error) {
                console.error('Setup: Failed to make binary executable:', error);
            }
        });
    });

    request.on('error', (err) => {
        fs.unlink(destPath, () => { }); // Delete failed file
        console.error('Setup: Download error:', err.message);
        process.exit(1);
    });
}
