import os
import base64
import requests
from datetime import datetime
from flask import Flask, send_from_directory, request, jsonify

app = Flask(__name__, static_folder='.')

PORT = int(os.environ.get('PORT', 5000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
TEMPLATE_FOLDER = os.path.join(BASE_DIR, 'templates')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMPLATE_FOLDER, exist_ok=True)

TEMPLATES_MAP = {
    'drake.jpg': 'https://i.imgflip.com/30b1gx.jpg',
    'distracted.jpg': 'https://i.imgflip.com/1ur9b0.jpg',
    'change-my-mind.jpg': 'https://i.imgflip.com/24y43o.jpg',
    'doge.jpg': 'https://i.imgflip.com/4t0m5.jpg',
    'woman-yelling.jpg': 'https://i.imgflip.com/345v97.jpg',
    'two-buttons.jpg': 'https://i.imgflip.com/1yxkcp.jpg',
    'expanding-brain.jpg': 'https://i.imgflip.com/1jwhww.jpg',
    'mocking-spongebob.jpg': 'https://i.imgflip.com/1otk96.jpg',
    'is-this-pigeon.jpg': 'https://i.imgflip.com/1o00in.jpg',
    'always-has-been.png': 'https://i.imgflip.com/46e43q.png',
    'sad-pablo.jpg': 'https://i.imgflip.com/1c1uej.jpg',
    'waiting-skeleton.jpg': 'https://i.imgflip.com/2fm6x.jpg',
    'buff-doge-cheems.jpg': 'https://i.imgflip.com/59eev.jpg',
    'uno-draw-25.jpg': 'https://i.imgflip.com/3lmzyx.jpg',
}


def download_templates():
    """Telecharge les templates manquants depuis imgflip."""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    downloaded = 0
    for filename, url in TEMPLATES_MAP.items():
        filepath = os.path.join(TEMPLATE_FOLDER, filename)
        if os.path.exists(filepath):
            continue
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(resp.content)
                downloaded += 1
        except Exception:
            pass
    return downloaded


@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    if filename in ['index.html', 'style.css', 'app.js']:
        return send_from_directory(BASE_DIR, filename)
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/templates')
def list_templates():
    templates = []
    for f in sorted(os.listdir(TEMPLATE_FOLDER)):
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            templates.append({
                'name': os.path.splitext(f)[0].replace('-', ' ').title(),
                'url': f'/templates/{f}'
            })
    return jsonify(templates)


@app.route('/api/save', methods=['POST'])
def save_meme():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'success': False, 'error': 'Donnees manquantes'}), 400
    try:
        image_data = data['image'].split(',')[1]
        filename = f"meme_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        with open(filepath, 'wb') as f:
            f.write(base64.b64decode(image_data))
        return jsonify({'success': True, 'filename': filename, 'url': f'/uploads/{filename}'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/gallery')
def gallery():
    files = []
    for f in sorted(os.listdir(UPLOAD_FOLDER), reverse=True):
        if f.lower().endswith('.png'):
            ctime = os.path.getctime(os.path.join(UPLOAD_FOLDER, f))
            files.append({
                'filename': f,
                'url': f'/uploads/{f}',
                'date': datetime.fromtimestamp(ctime).isoformat()
            })
    return jsonify(files)


@app.route('/api/delete', methods=['POST'])
def delete_meme():
    data = request.get_json()
    if not data or 'filename' not in data:
        return jsonify({'success': False, 'error': 'Nom manquant'}), 400
    try:
        filepath = os.path.join(UPLOAD_FOLDER, data['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'Introuvable'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/templates/<path:filename>')
def template_file(filename):
    return send_from_directory(TEMPLATE_FOLDER, filename)


if __name__ == '__main__':
    download_templates()
    app.run(host='0.0.0.0', port=PORT, debug=False)