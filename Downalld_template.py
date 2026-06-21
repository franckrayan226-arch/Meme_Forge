import os
import requests

TEMPLATE_FOLDER = 'templates'
os.makedirs(TEMPLATE_FOLDER, exist_ok=True)

TEMPLATES = {
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

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

print("Telechargement des templates...")
for filename, url in TEMPLATES.items():
    filepath = os.path.join(TEMPLATE_FOLDER, filename)
    if os.path.exists(filepath):
        print(f"  {filename} deja present")
        continue
    try:
        resp = requests.get(url, headers=headers, timeout=20)
        if resp.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(resp.content)
            print(f"  OK: {filename} ({len(resp.content)} bytes)")
        else:
            print(f"  ERREUR HTTP {resp.status_code}: {filename}")
    except Exception as e:
        print(f"  ERREUR {filename}: {e}")

print(f"\nTotal: {len(os.listdir(TEMPLATE_FOLDER))} templates")