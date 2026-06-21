const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const templatesGrid = document.getElementById('templatesGrid');
const canvasContainer = document.getElementById('canvasContainer');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const galleryDrawer = document.getElementById('galleryDrawer');
const galleryTrigger = document.getElementById('galleryTrigger');
const closeGallery = document.getElementById('closeGallery');

const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeVal = document.getElementById('fontSizeVal');
const textColorInput = document.getElementById('textColor');
const fontFamilyInput = document.getElementById('fontFamily');
const strokeWidthInput = document.getElementById('strokeWidth');
const strokeWidthVal = document.getElementById('strokeWidthVal');
const uploadInput = document.getElementById('uploadInput');
const exportBtn = document.getElementById('exportBtn');
const saveBtn = document.getElementById('saveBtn');
const shareBtn = document.getElementById('shareBtn');
const galleryGrid = document.getElementById('galleryGrid');
const emptyGallery = document.getElementById('emptyGallery');

let currentImage = null;
let imageLoaded = false;

function init() {
    loadTemplatesFromServer();
    bindEvents();
    loadGallery();
    setupDragDrop();
    setupSidebar();
    setupGallery();
}

function setupSidebar() {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

function setupGallery() {
    galleryTrigger.addEventListener('click', () => {
        galleryDrawer.classList.add('open');
    });
    
    closeGallery.addEventListener('click', () => {
        galleryDrawer.classList.remove('open');
    });
    
    document.addEventListener('click', (e) => {
        if (galleryDrawer.classList.contains('open') && 
            !galleryDrawer.contains(e.target) && 
            !galleryTrigger.contains(e.target)) {
            galleryDrawer.classList.remove('open');
        }
    });
}

async function loadTemplatesFromServer() {
    try {
        const res = await fetch('/api/templates');
        const templates = await res.json();
        
        if (templates.length === 0) {
            templatesGrid.innerHTML = '<div style="grid-column:1/-1;color:var(--text-muted);text-align:center;padding:36px;font-size:12px;letter-spacing:0.5px;">Premier lancement en cours...<br>Patientez 30s puis rafraichissez.</div>';
            createPlaceholder();
            return;
        }
        
        renderTemplates(templates);
        loadTemplate(templates[0].url);
    } catch (e) {
        console.error('Erreur chargement templates:', e);
        templatesGrid.innerHTML = '<div style="grid-column:1/-1;color:var(--danger);text-align:center;padding:36px;font-size:12px;">Serveur non accessible.<br>Lancez: python app.py</div>';
        createPlaceholder();
    }
}

function renderTemplates(templates) {
    templatesGrid.innerHTML = '';
    templates.forEach((template, index) => {
        const card = document.createElement('div');
        card.className = 'template-card' + (index === 0 ? ' active' : '');
        card.dataset.url = template.url;
        card.dataset.name = template.name;
        
        const img = document.createElement('img');
        img.src = template.url;
        img.alt = template.name;
        img.loading = 'lazy';
        
        img.onerror = () => {
            img.style.display = 'none';
            card.style.background = 'var(--bg-tertiary)';
            card.innerHTML = '<span style="color:var(--text-muted);font-size:10px;display:flex;align-items:center;justify-content:center;height:100%;padding:8px;text-align:center;">' + template.name + '</span>';
        };
        
        card.appendChild(img);
        card.addEventListener('click', () => {
            selectTemplate(card, template.url);
            if (window.innerWidth <= 768) sidebar.classList.remove('open');
        });
        templatesGrid.appendChild(card);
    });
}

function selectTemplate(card, url) {
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    loadTemplate(url);
}

function loadTemplate(url) {
    imageLoaded = false;
    const img = new Image();
    img.onload = () => {
        currentImage = img;
        imageLoaded = true;
        resizeCanvas();
        drawMeme();
    };
    img.onerror = () => {
        console.error('Erreur chargement image:', url);
        createPlaceholder();
    };
    img.src = url;
}

function createPlaceholder() {
    canvas.width = 600;
    canvas.height = 400;
    ctx.fillStyle = '#1a2028';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#2a3544';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    ctx.fillStyle = '#5a8fb8';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Image non disponible', canvas.width / 2, canvas.height / 2);
    imageLoaded = false;
}

function resizeCanvas() {
    if (!currentImage) return;
    const containerWidth = canvasContainer.clientWidth - 56;
    const containerHeight = window.innerHeight * 0.52;
    const ratio = Math.min(containerWidth / currentImage.width, containerHeight / currentImage.height, 1);
    
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    canvas.style.width = (currentImage.width * ratio) + 'px';
    canvas.style.height = (currentImage.height * ratio) + 'px';
}

function drawMeme() {
    if (!imageLoaded || !currentImage) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    
    const fontSize = parseInt(fontSizeInput.value);
    const fontFamily = fontFamilyInput.value;
    const color = textColorInput.value;
    const strokeWidth = parseInt(strokeWidthInput.value);
    
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    
    const topText = topTextInput.value.toUpperCase();
    const bottomText = bottomTextInput.value.toUpperCase();
    const x = canvas.width / 2;
    const padding = fontSize * 0.5;
    
    if (topText) {
        const y = padding + fontSize * 0.3;
        if (strokeWidth > 0) ctx.strokeText(topText, x, y);
        ctx.fillText(topText, x, y);
    }
    
    if (bottomText) {
        const y = canvas.height - padding;
        if (strokeWidth > 0) ctx.strokeText(bottomText, x, y);
        ctx.fillText(bottomText, x, y);
    }
}

function bindEvents() {
    [topTextInput, bottomTextInput, fontFamilyInput].forEach(el => {
        el.addEventListener('input', drawMeme);
    });
    
    fontSizeInput.addEventListener('input', () => {
        fontSizeVal.textContent = fontSizeInput.value;
        drawMeme();
    });
    
    textColorInput.addEventListener('input', drawMeme);
    
    strokeWidthInput.addEventListener('input', () => {
        strokeWidthVal.textContent = strokeWidthInput.value;
        drawMeme();
    });
    
    uploadInput.addEventListener('change', handleUpload);
    exportBtn.addEventListener('click', exportMeme);
    saveBtn.addEventListener('click', saveToGallery);
    shareBtn.addEventListener('click', shareMeme);
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawMeme();
    });
}

function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    handleFile(file);
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Veuillez selectionner un fichier image valide.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            imageLoaded = true;
            resizeCanvas();
            drawMeme();
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function setupDragDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, () => {
            canvasContainer.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, () => {
            canvasContainer.classList.remove('drag-over');
        }, false);
    });
    
    canvasContainer.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) handleFile(files[0]);
    }, false);
}

function exportMeme() {
    if (!imageLoaded) return;
    const link = document.createElement('a');
    link.download = 'memeforge-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

async function saveToGallery() {
    if (!imageLoaded) {
        alert('Aucune image a sauvegarder.');
        return;
    }
    try {
        const dataUrl = canvas.toDataURL('image/png');
        const res = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl })
        });
        const data = await res.json();
        if (data.success) {
            loadGallery();
            saveBtn.textContent = 'Sauvegarde OK';
            setTimeout(() => saveBtn.textContent = 'Sauvegarder', 1500);
        } else {
            alert('Erreur: ' + (data.error || 'Inconnue'));
        }
    } catch (e) {
        console.error(e);
        alert('Erreur reseau lors de la sauvegarde.');
    }
}

async function shareMeme() {
    if (!imageLoaded) return;
    try {
        const blob = await (await fetch(canvas.toDataURL('image/png'))).blob();
        const file = new File([blob], 'memeforge-meme.png', { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Mon meme MemeForge',
                text: 'Regarde ce meme que j\'ai cree avec MemeForge.'
            });
        } else {
            if (navigator.clipboard && window.ClipboardItem) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                shareBtn.textContent = 'Copie OK';
                setTimeout(() => shareBtn.textContent = 'Partager', 1500);
            } else {
                exportMeme();
            }
        }
    } catch (e) {
        console.error(e);
        if (e.name !== 'AbortError') {
            exportMeme();
        }
    }
}

async function loadGallery() {
    try {
        const res = await fetch('/api/gallery');
        const memes = await res.json();
        renderGallery(memes);
    } catch (e) {
        console.error('Erreur chargement galerie:', e);
    }
}

function renderGallery(memes) {
    galleryGrid.innerHTML = '';
    if (memes.length === 0) {
        galleryGrid.appendChild(emptyGallery);
        return;
    }
    
    memes.forEach(meme => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = meme.url;
        img.alt = meme.filename;
        img.loading = 'lazy';
        
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = 'x';
        delBtn.title = 'Supprimer';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteMeme(meme.filename);
        });
        
        item.appendChild(img);
        item.appendChild(delBtn);
        
        item.addEventListener('click', () => {
            loadTemplate(meme.url);
            galleryDrawer.classList.remove('open');
        });
        
        galleryGrid.appendChild(item);
    });
}

async function deleteMeme(filename) {
    if (!confirm('Supprimer ce meme ?')) return;
    try {
        const res = await fetch('/api/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename })
        });
        const data = await res.json();
        if (data.success) {
            loadGallery();
        }
    } catch (e) {
        console.error(e);
    }
}

init();