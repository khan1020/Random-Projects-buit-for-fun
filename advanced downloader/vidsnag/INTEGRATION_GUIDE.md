# VidSnag - Video Downloader Integration Guide

## 🎯 Current Status

### ✅ What's Working
- **Auto-fetch**: Automatically fetches video info 1 second after pasting a URL (no need to click button!)
- **UI/UX**: Beautiful, responsive interface
- **Mock Data**: Demo system showing sample videos

### ⚠️ Mock Data Explanation

Currently, the app shows **sample/demo videos** because:
- The backend API routes (`/api/video/info` and `/api/video/download`) return **mock data**
- This is intentional for development and demo purposes
- Real video downloading requires a backend service with `yt-dlp`

---

## 🔧 How to Integrate Real Video Downloading

To make the app download **real videos**, you need to integrate a backend service. Here are your options:

### **Option 1: Use a Third-Party API** ⭐ Recommended for Quick Setup

Use services like:
- **RapidAPI Video Downloader APIs** (easiest, paid)
- **AllTube** (open-source, self-hosted)
- **YouTube-DL API services**

Example with RapidAPI:
```typescript
// src/app/api/video/info/route.ts
export async function POST(request: NextRequest) {
    const { url } = await request.json();
    
    const response = await fetch('https://youtube-dl-api.p.rapidapi.com/info', {
        method: 'POST',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
}
```

### **Option 2: Build Your Own Backend** (Free, Full Control)

Deploy a separate backend service with `yt-dlp`:

1. **Create a Node.js/Python backend**
2. **Install yt-dlp**: `npm install yt-dlp-wrap` or `pip install yt-dlp`
3. **Deploy on Railway/Render** (free tier available)
4. **Update API routes** to call your backend

Example Python backend (FastAPI):
```python
from fastapi import FastAPI
import yt_dlp

app = FastAPI()

@app.post("/api/video/info")
async def get_video_info(url: str):
    ydl_opts = {'quiet': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        return {
            "title": info['title'],
            "thumbnail": info['thumbnail'],
            "duration": info['duration_string'],
            "formats": info['formats']
        }
```

### **Option 3: Use Cloudflare Workers** (Serverless, Scalable)

Deploy yt-dlp as a Cloudflare Worker for free serverless execution.

---

## 🚀 Quick Start with Mock Data (Current Setup)

The current implementation works as follows:

1. **Paste any URL** → Auto-fetches after 1 second
2. **Shows mock data** based on detected platform:
   - YouTube URLs → YouTube sample
   - Instagram URLs → Instagram sample
   - TikTok URLs → TikTok sample
   - etc.

3. **Click Download** → Returns a demo file (not real video)

---

## 📝 Next Steps

To get real video downloading:

1. Choose an integration option above
2. Update `/src/app/api/video/info/route.ts`
3. Update `/src/app/api/video/download/route.ts`
4. Add environment variables for API keys
5. Test with real URLs

---

## 🔒 Important Notes

- **Legal**: Ensure compliance with platform ToS when downloading videos
- **Rate Limiting**: Already implemented in the API routes
- **Storage**: Consider using S3/R2 for temporary file storage
- **CORS**: May need to configure CORS for API requests

---

## 💡 Auto-Fetch Feature

The auto-fetch feature is now active! Features:
- ⚡ **Automatic**: Fetches video info 1 second after URL is pasted
- 🔍 **Smart**: Only triggers for valid URLs
- 🚫 **Debounced**: Prevents excessive API calls while typing
- ✨ **Seamless**: No button click required!

You can still click "Get Video" button if you prefer manual control.

---

For questions or help with integration, refer to:
- [yt-dlp documentation](https://github.com/yt-dlp/yt-dlp)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
