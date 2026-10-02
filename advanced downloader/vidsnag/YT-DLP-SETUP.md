# 🚀 YT-DLP Setup Guide

## ✅ What I've Done

I've integrated **yt-dlp** into your VidSnag app for **FREE, UNLIMITED** video downloading without API keys!

## 📦 Installation Required

You need to install 2 things:

### 1. Install Node.js Package
Run this in your Command Prompt:
```bash
cd "c:\Users\AfzalTAS\Desktop\Random-Projects-buit-for-fun\advanced downloader\vidsnag"
npm install
```

### 2. Install YT-DLP Binary

**Option A: Using Chocolatey** (Easiest on Windows)
```bash
choco install yt-dlp
```

**Option B: Manual Download**
1. Download from: https://github.com/yt-dlp/yt-dlp/releases/latest
2. Download `yt-dlp.exe`
3. Add to your PATH or place in `C:\Windows\System32\`

**Option C: Using winget** (Windows 10/11)
```bash
winget install yt-dlp
```

### 3. Verify Installation
```bash
yt-dlp --version
```

If you see a version number, you're good! ✅

## 🎯 How to Run

After installation:
```bash
npm run dev
```

Then paste any YouTube/Instagram/TikTok link and it will show the **REAL video**! 🎉

## 🌟 What You Get

- ✅ **Real video info** (title, thumbnail, views, author)
- ✅ **Multiple quality options** (4K, 1080p, 720p, etc.)
- ✅ **File sizes** for each quality
- ✅ **Audio-only option**
- ✅ **No API keys required**
- ✅ **Unlimited usage**
- ✅ **Free forever**

## ⚠️ Important Notes

### Supported Platforms
- YouTube ✅
- Instagram ✅
- TikTok ✅
- Facebook ✅
- Twitter/X ✅
- Reddit ✅
- Vimeo ✅
- 1000+ other sites ✅

### Limitations
- Works **locally** (your computer)
- To deploy online (Vercel/Netlify), you'll need a separate backend
- Download speed depends on your internet

## 🔧 Troubleshooting

**Error: "yt-dlp not found"**
- Make sure yt-dlp is installed and in your PATH
- Restart your terminal after installation

**Error: "Unable to extract video info"**
- The URL might be invalid
- The platform might have changed their API
- Run `yt-dlp --update` to update yt-dlp

**Video info loads slowly**
- Normal! yt-dlp needs to fetch data from the platform
- Usually takes 2-5 seconds

## 🎉 Next Steps

1. Install yt-dlp binary (see above)
2. Run `npm install`
3. Start the server: `npm run dev`
4. Paste a real YouTube link
5. Watch it fetch the REAL video! 🚀

Enjoy unlimited, free video downloading! 🎊
