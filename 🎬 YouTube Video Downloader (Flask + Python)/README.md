# 🎬 YouTube Video Downloader (Flask + yt-dlp)

![Status](https://img.shields.io/badge/status-Development-yellow)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A **web-based YouTube video downloader** with a Flask backend and `yt-dlp` as the download engine.  
Fetch video metadata, choose resolution, track live progress, and download the file from a browser UI.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Folder Structure](#folder-structure)  
- [Installation](#installation)  
- [Usage](#usage)  
- [API Endpoints](#api-endpoints)  
- [How Download & Progress Work](#how-download--progress-work)  
- [Security & Limitations](#security--limitations)  
- [Testing Locally](#testing-locally)  
- [Future Improvements](#future-improvements)  
- [Author](#author)  
- [License](#license)  
- [Sources](#sources)

---

## 🚀 Project Overview

This project provides a small web application that allows users to paste a YouTube video link (or ID), fetch available qualities, start a background download (via `yt-dlp`), monitor progress through a streaming endpoint, and finally download the resulting file. Temporary files are stored in `temp_downloads/` and removed after delivery.

---

## ✅ Features

- Fetch video metadata: title, thumbnail, duration.  
- Detect available resolutions (144p → 8K when available).  
- Start downloads in a background thread (non-blocking).  
- Real-time progress streaming (SSE-like endpoint returning JSON lines).  
- Safe filename generation and temporary-storage cleanup after download.  
- Error handling for invalid IDs, restricted/private videos, and subprocess issues.  
- Simple, responsive front-end (HTML/CSS/JS) to interact with the API.

---

## 🧰 Tech Stack

- Backend: `Python` + `Flask`  
- Downloader: `yt-dlp` (invoked via `python -m yt_dlp`)  
- CORS: `flask-cors`  
- Concurrency: `threading` for background downloads  
- Logging: Python `logging` module  
- Frontend: HTML / CSS / vanilla JavaScript (AJAX / Fetch)

---

## 📁 Folder Structure (suggested)

Task_YTDownloader/
│
├── app.py # Main Flask app (your code)
├── requirements.txt # pip dependencies
├── templates/
│ └── index.html # Frontend UI
├── static/
│ ├── style.css
│ └── script.js
├── temp_downloads/ # Temporary download files (created at runtime)
└── README.md

yaml
Copy code

---

## ⚙️ Installation

> Tested with Python 3.10+.

1. Clone repo:
```bash
git clone https://github.com/yourusername/youtube-downloader.git
cd youtube-downloader
Create a virtual environment & activate:

bash
Copy code
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
Install dependencies:

bash
Copy code
pip install -r requirements.txt
If you don't have a requirements.txt, install directly:

bash
Copy code
pip install flask flask-cors yt-dlp
Run the app:

bash
Copy code
python app.py
Open: http://127.0.0.1:5000/

🧭 Usage (Quick)
Open the UI in a browser.

Paste YouTube video URL or ID.

Click Fetch Video Info — choose resolution.

Click Download — the backend returns a download_id.

Poll /progress/<download_id> to get live progress updates.

Once status is completed, GET /download-file/<download_id> to download the file. The server will remove the file after it is delivered.

🔌 API Endpoints
GET /
Renders the front-end UI (index.html).

POST /get-video-info
Request JSON

json
Copy code
{ "videoId": "VIDEO_ID" }
Response

json
Copy code
{
  "success": true,
  "resolutions": [{ "value": "best", "label": "Best Available Quality" }, ...],
  "video_info": {
    "video_id": "XXXXXXX",
    "title": "Video Title",
    "thumbnail": "https://...",
    "duration": "12:34"
  }
}
POST /start-download
Request JSON

json
Copy code
{ "videoId": "VIDEO_ID", "resolution": "720p" }
Response

json
Copy code
{
  "success": true,
  "download_id": "uuid-string",
  "filename": "Video_Title.mp4",
  "progress_url": "/progress/<download_id>",
  "download_url": "/download-file/<download_id>"
}
GET /progress/<download_id>
Returns a streaming response (text/plain) with JSON lines representing progress updates, e.g.:

css
Copy code
data: {"status":"downloading","progress":32.4}
Polling or streaming this endpoint provides live status. It ends when status becomes completed or error.

GET /download-file/<download_id>
Sends the completed video file as an attachment. On close, server attempts to delete the temporary file and progress entry.

🔍 How Download & Progress Work
start-download spawns a background threading.Thread that runs yt-dlp with --newline so yt-dlp prints progress lines.

The thread parses stdout lines (those containing [download]), extracts percentage values, and updates an in-memory download_progress dictionary keyed by download_id.

/progress/<download_id> reads that dict repeatedly and streams JSON lines to the client whenever progress changes.

Once yt-dlp finishes, the thread marks status completed and stores file_path and file_size. Client then downloads via /download-file/<download_id>. The server deletes the file after sending it.

🔐 Security & Limitations
Only local usage recommended unless you harden the app and respect service terms. Public deployment requires rate-limiting, auth, and request validation.

YouTube Terms of Service: Be aware of YouTube's TOS regarding content downloading. Use responsibly and only for permitted content.

No persistent storage: All progress and files are stored in memory / temp folder — not a DB. This is simple but not resilient across server restarts.

Resource limits: Concurrent downloads may saturate bandwidth and disk. Implement queueing, quotas, and storage limits for production.

Input validation: Basic video ID regex is used (^[a-zA-Z0-9_-]{11}$) — but users can still provide full URLs; your front-end should extract ID safely.

🧪 Testing Locally
Try videos with different qualities: short clips, HD, and private/restricted videos to observe error handling.

Test multiple simultaneous downloads to observe memory and disk usage.

Use curl or Postman to call endpoints directly for automated tests.

Example: fetch video info via curl

bash
Copy code
curl -X POST http://127.0.0.1:5000/get-video-info \
  -H "Content-Type: application/json" \
  -d '{"videoId":"dQw4w9WgXcQ"}'
♻️ Cleanup Behavior
The file is removed after successful send_file and the download_progress entry is deleted.

If downloads fail or the server restarts, temporary files can remain — add a cron/cleanup routine in production to purge old files (e.g., older than 24 hours).

🔮 Future Improvements
Add authentication + user download history.

Persist metadata in a database.

Add audio-only (MP3) extraction option.

Add download queue management and rate-limiting.

Dockerize the app + use a supervisor to restart threads gracefully.

Add unit/integration tests for endpoints and downloader logic.

🧑‍💻 Author
Afzal Khan — Computer Science Student & Developer
GitHub: https://github.com/khan1020
LinkedIn: https://shorturl.at/ysFhT

📜 License
This project is provided under the MIT License — see LICENSE file.

🧾 Sources
yt-dlp project (downloader engine) — https://github.com/yt-dlp/yt-dlp

Flask documentation — https://flask.palletsprojects.com/
