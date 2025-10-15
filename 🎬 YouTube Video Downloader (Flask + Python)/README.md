🎬 YouTube Video Downloader (Flask + Python)

A web-based YouTube video downloader built using Flask (Python backend) and a responsive front-end interface.
It allows users to fetch video info, select resolution, and download videos directly from YouTube in multiple qualities.

📌 Project Overview

This project integrates Flask as the backend and yt-dlp as the video download engine to create a smooth, interactive downloader.
Users can input a YouTube video URL, view available resolutions, and download the desired video — all from their browser.

⚙️ Technologies Used
🔹 Frontend

HTML5, CSS3, JavaScript (Vanilla JS)

Responsive design using Flexbox

AJAX (for communication with Flask backend)

Bootstrap (optional styling)

🔹 Backend

Python Flask (Web framework)

yt-dlp (Advanced YouTube video downloader)

Flask-CORS (Cross-origin support)

Threading (For background download execution)

Logging & Error Handling

🚀 Features

✅ Fetches YouTube video information using video ID
✅ Displays video title, thumbnail, and duration
✅ Lists available resolutions (144p – 8K)
✅ Allows downloading in best or custom quality
✅ Real-time download progress tracking
✅ Clean RESTful API endpoints
✅ Dark mode / light mode ready (optional front-end)
✅ Automatic temporary file cleanup after download
✅ Responsive and mobile-friendly web UI

🧩 Folder Structure
Task_YTDownloader/
│
├── app.py                 # Main Flask backend
├── templates/
│   └── index.html         # Front-end UI
├── static/
│   ├── style.css          # Styles
│   └── script.js          # JavaScript (AJAX + UI)
├── temp_downloads/        # Temporary storage for downloaded files
└── README.md              # Project documentation

⚙️ Installation & Setup
1. Clone the Repository
git clone https://github.com/yourusername/youtube-downloader.git
cd youtube-downloader

2. Create and Activate Virtual Environment
python -m venv venv
venv\Scripts\activate      # On Windows
# OR
source venv/bin/activate   # On macOS/Linux

3. Install Dependencies
pip install flask flask-cors yt-dlp

4. Run the App
python app.py


The server will start on:
👉 http://127.0.0.1:5000/

💻 Usage Guide

Open the web page in your browser.

Paste a YouTube video link or ID.

Click “Fetch Video Info”.

Select a resolution (e.g., 720p, 1080p).

Press “Download” — the progress bar will update live.

Once finished, click the Download File button to save the video.

🧠 Key Backend Endpoints
Endpoint	Method	Description
/	GET	Renders main UI
/get-video-info	POST	Fetches title, duration, thumbnail, and resolutions
/start-download	POST	Initiates download thread and returns download_id
/progress/<download_id>	GET	Provides real-time progress updates
/download-file/<download_id>	GET	Serves the final video file for download
🔐 Error Handling & Logging

Invalid video IDs are detected via regex validation.

All subprocess and JSON errors are caught and logged.

Automatic cleanup removes downloaded files after transfer to save storage.

Logging outputs to console with detailed timestamps.

🧱 Advanced Functionalities

Background download threads using threading.Thread

Streamed server-sent progress updates

Dynamic video format detection (up to 8K)

Safe file naming and restricted filenames

Timeouts and graceful error messages for restricted/private videos

🌙 Future Improvements

Add user authentication

Display download speed and ETA

Allow MP3 (audio-only) extraction

Save user download history

Cloud-based hosting (Render / Vercel backend)

🧑‍💻 Author

Afzal Khan
📍 Computer Science Student | AI & Web Developer
🔗 GitHub: khan1020

🔗 LinkedIn: shorturl.at/ysFhT

📜 License

This project is licensed under the MIT License — free to use and modify with proper credit.
