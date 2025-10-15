from flask import Flask, request, send_file, jsonify, render_template, Response, stream_with_context
from flask_cors import CORS
import subprocess
import os
import uuid
import re
import sys
import json
import traceback
import logging
import threading
import time

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1", "http://localhost"])

DOWNLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_downloads')
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

# Store download progress
download_progress = {}
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-video-info', methods=['POST'])
def get_video_info():
    try:
        data = request.get_json()
        video_id = data.get('videoId')
        
        if not video_id or not re.match(r'^[a-zA-Z0-9_-]{11}$', video_id):
            return jsonify({'error': 'Invalid video ID'}), 400

        video_url = f"https://www.youtube.com/watch?v={video_id}"
        
        info_cmd = [
            sys.executable, '-m', 'yt_dlp',
            '--dump-json',
            '--no-warnings',
            video_url
        ]
        
        result = subprocess.run(info_cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            logging.error(f"yt_dlp error: {result.stderr}")
            return jsonify({'error': 'Could not fetch video information. Video might be private or restricted.'}), 500
        
        video_data = json.loads(result.stdout)
        
        available_heights = set()
        for fmt in video_data.get('formats', []):
            if fmt.get('vcodec') != 'none' and fmt.get('height'):
                height = fmt['height']
                if 144 <= height <= 4320:
                    available_heights.add(height)
        
        available_heights = sorted(available_heights, reverse=True)
        
        resolution_options = []
        standard_resolutions = [
            (4320, '8K (4320p)'),
            (2160, '4K (2160p)'),
            (1440, '1440p (QHD)'),
            (1080, '1080p (Full HD)'),
            (720, '720p (HD)'),
            (480, '480p'),
            (360, '360p'),
            (240, '240p'),
            (144, '144p (Lowest)')
        ]
        
        for height, label in standard_resolutions:
            if any(h >= height for h in available_heights):
                resolution_options.append({
                    'value': f'{height}p',
                    'label': label
                })
        
        if resolution_options:
            resolution_options.insert(0, {'value': 'best', 'label': '🎯 Best Available Quality'})
        else:
            resolution_options = [{'value': 'best', 'label': 'Best Available Quality'}]
        
        video_info = {
            'video_id': video_id,
            'title': video_data.get('title', 'Unknown Title'),
            'thumbnail': video_data.get('thumbnail', f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg'),
            'duration': video_data.get('duration_string', 'Unknown')
        }
        
        return jsonify({
            'success': True,
            'resolutions': resolution_options,
            'video_info': video_info
        })
    
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Timeout fetching video info'}), 500
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid response from downloader'}), 500
    except Exception as e:
        logging.error(f"Video info error: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to get video information'}), 500

@app.route('/start-download', methods=['POST'])
def start_download():
    try:
        data = request.get_json()
        video_id = data.get('videoId')
        requested_resolution = data.get('resolution', 'best')
        
        if not video_id or not re.match(r'^[a-zA-Z0-9_-]{11}$', video_id):
            return jsonify({'error': 'Invalid video ID'}), 400

        video_url = f"https://www.youtube.com/watch?v={video_id}"
        
        # Get video info for filename
        info_cmd = [
            sys.executable, '-m', 'yt_dlp',
            '--dump-json',
            '--no-warnings',
            video_url
        ]
        
        result = subprocess.run(info_cmd, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            return jsonify({'error': 'Failed to get video information'}), 500
        
        video_data = json.loads(result.stdout)
        
        # Format selection
        resolution_map = {
            '4320p': 'best[height<=4320]',
            '2160p': 'best[height<=2160]',
            '1440p': 'best[height<=1440]',
            '1080p': 'best[height<=1080]',
            '720p': 'best[height<=720]',
            '480p': 'best[height<=480]',
            '360p': 'best[height<=360]',
            '240p': 'best[height<=240]',
            '144p': 'best[height<=144]',
            'best': 'best'
        }
        
        format_selector = resolution_map.get(requested_resolution, 'best')
        
        # Generate download info
        download_id = str(uuid.uuid4())
        filename = re.sub(r'[^\w\.\-]', '_', video_data.get('title', 'video')) + '.mp4'
        
        # Initialize progress
        download_progress[download_id] = {
            'status': 'starting',
            'progress': 0,
            'filename': filename,
            'video_id': video_id,
            'resolution': requested_resolution
        }
        
        # Start download in background thread
        thread = threading.Thread(
            target=download_video,
            args=(download_id, video_url, format_selector, filename)
        )
        thread.daemon = True
        thread.start()
        
        logging.info(f"Started download: {download_id} for {video_id} at {requested_resolution}")
        
        return jsonify({
            'success': True,
            'download_id': download_id,
            'filename': filename,
            'progress_url': f'/progress/{download_id}',
            'download_url': f'/download-file/{download_id}'
        })
    
    except Exception as e:
        logging.error(f"Start download error: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to start download: {str(e)}'}), 500

def download_video(download_id, video_url, format_selector, filename):
    try:
        temp_id = str(uuid.uuid4())
        output_template = os.path.join(DOWNLOAD_FOLDER, f"{temp_id}_%(title)s.%(ext)s")
        
        # Update status to downloading
        download_progress[download_id].update({
            'status': 'downloading',
            'progress': 5
        })
        
        # Download command with progress tracking
        yt_dlp_command = [
            sys.executable, '-m', 'yt_dlp',
            '-f', format_selector,
            '--restrict-filenames',
            '--newline',  # Get progress updates
            '--output', output_template,
            video_url
        ]
        
        logging.info(f"Executing download: {' '.join(yt_dlp_command)}")
        
        process = subprocess.Popen(
            yt_dlp_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Parse progress output
        for line in process.stdout:
            if '[download]' in line:
                # Parse progress percentage
                if '%' in line:
                    try:
                        # Extract percentage like "45.2%"
                        percent_str = line.split('[download]')[-1].strip().split('%')[0].strip()
                        progress = float(percent_str)
                        # Scale to 5-95% (since we start at 5% and complete at 95%)
                        scaled_progress = 5 + (progress * 0.9)
                        download_progress[download_id].update({
                            'progress': min(scaled_progress, 95),
                            'status': 'downloading'
                        })
                        logging.info(f"Download {download_id} progress: {progress}%")
                    except (ValueError, IndexError):
                        pass
                elif 'Download completed' in line or '100%' in line:
                    download_progress[download_id].update({
                        'progress': 95,
                        'status': 'processing'
                    })
        
        # Wait for process to complete
        return_code = process.wait()
        
        if return_code != 0:
            download_progress[download_id].update({
                'status': 'error',
                'error': 'Download failed'
            })
            return
        
        # Find downloaded file
        downloaded_files = [f for f in os.listdir(DOWNLOAD_FOLDER) if f.startswith(temp_id)]
        if not downloaded_files:
            download_progress[download_id].update({
                'status': 'error',
                'error': 'File not found after download'
            })
            return
        
        final_path = os.path.join(DOWNLOAD_FOLDER, downloaded_files[0])
        file_size = os.path.getsize(final_path)
        
        # Update with final file info
        download_progress[download_id].update({
            'status': 'completed',
            'progress': 100,
            'file_path': final_path,
            'file_size': file_size,
            'temp_id': temp_id
        })
        
        logging.info(f"Download completed: {download_id}, file size: {file_size} bytes")
        
    except Exception as e:
        logging.error(f"Download thread error: {traceback.format_exc()}")
        download_progress[download_id].update({
            'status': 'error',
            'error': str(e)
        })

@app.route('/progress/<download_id>')
def get_progress(download_id):
    def generate():
        last_progress = -1
        while True:
            if download_id not in download_progress:
                yield f"data: {json.dumps({'error': 'Download not found'})}\n\n"
                break
            
            progress_data = download_progress[download_id].copy()
            current_progress = progress_data.get('progress', 0)
            
            # Only send if progress changed or it's a status change
            if current_progress != last_progress or progress_data.get('status') in ['completed', 'error']:
                yield f"data: {json.dumps(progress_data)}\n\n"
                last_progress = current_progress
            
            # Stop if download is complete or error
            if progress_data.get('status') in ['completed', 'error']:
                break
            
            time.sleep(0.5)  # Update every 500ms
    
    return Response(generate(), mimetype='text/plain')

@app.route('/download-file/<download_id>')
def download_file(download_id):
    try:
        if download_id not in download_progress:
            return "Download not found", 404
        
        progress_data = download_progress[download_id]
        
        if progress_data.get('status') != 'completed':
            return "Download not completed yet", 400
        
        file_path = progress_data.get('file_path')
        filename = progress_data.get('filename')
        
        if not file_path or not os.path.exists(file_path):
            return "File not found", 404
        
        response = send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='video/mp4'
        )
        
        # Clean up after download
        @response.call_on_close
        def cleanup():
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logging.info(f"Cleaned up: {file_path}")
                # Remove progress data after some time
                if download_id in download_progress:
                    del download_progress[download_id]
            except Exception as e:
                logging.error(f"Cleanup error: {e}")
        
        return response
        
    except Exception as e:
        logging.error(f"Download file error: {traceback.format_exc()}")
        return "Download failed", 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')