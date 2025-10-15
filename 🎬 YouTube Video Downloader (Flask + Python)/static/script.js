// scripts.js - With live progress bar on webpage
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('video-url');
    const analyzeBtn = document.getElementById('analyze-btn');
    const videoInfoDiv = document.getElementById('video-info');
    const thumbnailImg = document.getElementById('video-thumbnail');
    const titleP = document.getElementById('video-title');
    const downloadBtn = document.getElementById('download-btn');
    const resolutionSelect = document.getElementById('resolution-select');
    const messageP = document.getElementById('message');

    const BACKEND_URL = 'http://127.0.0.1:5000';
    let currentVideoId = null;
    let currentDownloadId = null;

    // Create progress bar elements
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        width: 100%;
        background: #f0f0f0;
        border-radius: 10px;
        margin: 10px 0;
        display: none;
    `;

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 0%;
        height: 20px;
        background: linear-gradient(90deg, #4CAF50, #45a049);
        border-radius: 10px;
        transition: width 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
    `;

    const progressText = document.createElement('div');
    progressText.style.cssText = `
        text-align: center;
        margin-top: 5px;
        font-size: 14px;
        color: #333;
    `;

    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    document.querySelector('.container').appendChild(progressContainer);

    function extractVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|\w+\/|embed\/|v\/|shorts\/)?|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    function showMessage(text, isError = false) {
        messageP.textContent = text;
        messageP.style.color = isError ? '#ff0000' : '#008000';
        messageP.style.fontWeight = 'bold';
    }

    function setButtonState(button, isLoading, loadingText, normalText, loadingColor, normalColor) {
        button.disabled = isLoading;
        button.textContent = isLoading ? loadingText : normalText;
        button.style.backgroundColor = isLoading ? loadingColor : normalColor;
    }

    function populateResolutions(resolutions) {
        resolutionSelect.innerHTML = '';
        resolutions.forEach(res => {
            const option = document.createElement('option');
            option.value = res.value;
            option.textContent = res.label;
            resolutionSelect.appendChild(option);
        });
    }

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return 'Unknown size';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function updateProgressBar(progress, status, filename = '') {
        progressContainer.style.display = 'block';
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
        
        let statusText = '';
        switch(status) {
            case 'starting':
                statusText = '🔄 Starting download...';
                break;
            case 'downloading':
                statusText = `📥 Downloading: ${filename}`;
                break;
            case 'processing':
                statusText = '⚙️ Processing video...';
                break;
            case 'completed':
                statusText = '✅ Download complete!';
                break;
            case 'error':
                statusText = '❌ Download failed';
                break;
            default:
                statusText = `Progress: ${Math.round(progress)}%`;
        }
        
        progressText.textContent = statusText;
    }

    function hideProgressBar() {
        progressContainer.style.display = 'none';
    }

    function startProgressTracking(downloadId, filename) {
        const eventSource = new EventSource(`${BACKEND_URL}/progress/${downloadId}`);
        
        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            if (data.error) {
                showMessage(`❌ ${data.error}`, true);
                eventSource.close();
                setButtonState(downloadBtn, false, 'Downloading...', 'Start Download', '#ffa500', '#4CAF50');
                hideProgressBar();
                return;
            }
            
            updateProgressBar(data.progress, data.status, filename);
            
            if (data.status === 'completed') {
                showMessage('✅ Download complete! Starting file transfer...');
                eventSource.close();
                
                // Trigger the actual file download
                setTimeout(() => {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = `${BACKEND_URL}/download-file/${downloadId}`;
                    downloadLink.download = filename;
                    downloadLink.style.display = 'none';
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    
                    // Reset UI after download
                    setTimeout(() => {
                        setButtonState(downloadBtn, false, 'Downloading...', 'Start Download', '#ffa500', '#4CAF50');
                        hideProgressBar();
                        showMessage(`🎉 Download completed: ${filename}`);
                    }, 2000);
                }, 1000);
                
            } else if (data.status === 'error') {
                showMessage(`❌ Download failed: ${data.error}`, true);
                eventSource.close();
                setButtonState(downloadBtn, false, 'Downloading...', 'Start Download', '#ffa500', '#4CAF50');
                setTimeout(() => hideProgressBar(), 3000);
            }
        };
        
        eventSource.onerror = function() {
            eventSource.close();
        };
        
        return eventSource;
    }

    // Analyze button handler
    analyzeBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        currentVideoId = extractVideoId(url);

        videoInfoDiv.classList.add('hidden');
        hideProgressBar();
        setButtonState(downloadBtn, true, 'Start Download', 'Start Download', '#cccccc', '#4CAF50');
        showMessage('');
        setButtonState(analyzeBtn, true, 'Analyzing...', 'Analyze Video', '#cccccc', '#ff0000');

        if (!currentVideoId) {
            showMessage('❌ Invalid YouTube URL. Please check the link.', true);
            setButtonState(analyzeBtn, false, 'Analyzing...', 'Analyze Video', '#cccccc', '#ff0000');
            return;
        }

        try {
            showMessage('🔍 Analyzing video...');

            const response = await fetch(`${BACKEND_URL}/get-video-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: currentVideoId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const data = await response.json();
            if (!data.success) throw new Error('Video analysis failed');

            populateResolutions(data.resolutions || [{value: 'best', label: 'Best Available Quality'}]);
            showMessage(`✅ Found ${data.resolutions.length} quality options`);

            // Video info
            const info = data.video_info;
            titleP.textContent = info.title || `Video ID: ${currentVideoId}`;
            thumbnailImg.src = info.thumbnail;
            thumbnailImg.onerror = () => { 
                thumbnailImg.src = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`;
            };

            videoInfoDiv.classList.remove('hidden');
            setButtonState(downloadBtn, false, 'Start Download', 'Start Download', '#cccccc', '#4CAF50');

        } catch (error) {
            showMessage(`❌ ${error.message}`, true);
            console.error('Analysis Error:', error);
        } finally {
            setButtonState(analyzeBtn, false, 'Analyzing...', 'Analyze Video', '#cccccc', '#ff0000');
        }
    });

    // Download button handler - With live progress
    downloadBtn.addEventListener('click', async () => {
        if (!currentVideoId) {
            showMessage('❌ Please analyze a video first.', true);
            return;
        }

        const resolution = resolutionSelect.value;
        if (!resolution) {
            showMessage('❌ Please select a quality option.', true);
            return;
        }

        setButtonState(downloadBtn, true, 'Starting...', 'Start Download', '#ffa500', '#4CAF50');
        showMessage('⏱️ Starting download...');

        try {
            // Start the download process
            const response = await fetch(`${BACKEND_URL}/start-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    videoId: currentVideoId, 
                    resolution: resolution 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Download failed to start');
            }

            const data = await response.json();
            if (!data.success) throw new Error('Download initialization failed');

            currentDownloadId = data.download_id;
            showMessage(`📥 Download started: ${data.filename}`);

            // Start tracking progress
            startProgressTracking(data.download_id, data.filename);

        } catch (error) {
            showMessage(`❌ ${error.message}`, true);
            console.error('Download Error:', error);
            setButtonState(downloadBtn, false, 'Starting...', 'Start Download', '#ffa500', '#4CAF50');
        }
    });

    // Enter key for analysis
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') analyzeBtn.click();
    });

    // Reset on new input
    urlInput.addEventListener('input', () => {
        showMessage('');
        currentVideoId = null;
        currentDownloadId = null;
        videoInfoDiv.classList.add('hidden');
        hideProgressBar();
        setButtonState(downloadBtn, true, 'Start Download', 'Start Download', '#cccccc', '#4CAF50');
    });

    // Initial state
    setButtonState(downloadBtn, true, 'Start Download', 'Start Download', '#cccccc', '#4CAF50');
    hideProgressBar();
});