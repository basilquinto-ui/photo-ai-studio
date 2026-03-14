// ═══════════════════════════════════════════
//  Photo AI Studio — by sjiatravels.com
//  app.js
// ═══════════════════════════════════════════

const OUTPUT_SIZES = {
  passport: { w: 413, h: 531, label: 'passport-35x45mm' },
  visa:     { w: 600, h: 600, label: 'visa-2x2in'       },
  id:       { w: 295, h: 413, label: 'id-card-25x35mm'  },
  square:   { w: 400, h: 400, label: 'square-1x1in'     },
};

const AD_SLIDES = [
  {
    icon: '✈',
    headline: 'Planning your next vacation?',
    body: 'Find the best flights, hotels & tour packages',
    cta: 'Visit www.sjiatravels.com',
  },
  {
    icon: '🌏',
    headline: 'Travel the world with us!',
    body: 'Affordable packages to Asia, Europe & beyond',
    cta: 'Visit www.sjiatravels.com',
  },
  {
    icon: '🏨',
    headline: 'Need a hotel for your trip?',
    body: 'Exclusive deals on hotels worldwide',
    cta: 'Visit www.sjiatravels.com',
  },
  {
    icon: '📋',
    headline: 'Visa assistance made easy',
    body: 'We help with visa applications & documentation',
    cta: 'Visit www.sjiatravels.com',
  },
  {
    icon: '🎒',
    headline: 'All-inclusive tour packages',
    body: 'Flights + Hotel + Tours — one easy booking',
    cta: 'Visit www.sjiatravels.com',
  },
];

let state = {
  src: null,
  style: 'Formal Suit',
  format: 'passport',
  outputDataUrl: null,
  filename: 'photo.png',
  analyzing: false,
};

let adInterval = null;
let adIndex = 0;

const $ = (id) => document.getElementById(id);

// ─────────────────────────────────────────
// SPLASH → APP
// ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  buildStars();
  buildPins();

  setTimeout(() => {
    const splash = $('splash');
    splash.style.opacity = '0';
    splash.style.transform = 'scale(1.04)';
    setTimeout(() => {
      splash.style.display = 'none';
      $('app').style.display = 'block';
    }, 700);
  }, 3500);
});

function buildStars() {
  const container = $('stars');
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.2 + 0.5;
    s.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `top:${Math.random() * 68}%`,
      `left:${Math.random() * 100}%`,
      `--d:${2 + Math.random() * 4}s`,
      `--dl:${Math.random() * 5}s`,
      `--op:${(0.25 + Math.random() * 0.65).toFixed(2)}`,
    ].join(';');
    container.appendChild(s);
  }
}

function buildPins() {
  const pins = [
    { top: '26%', left: '16%', size: '22px', dur: '5s', delay: '0s'   },
    { top: '40%', left: '76%', size: '30px', dur: '7s', delay: '1.4s' },
    { top: '58%', left: '10%', size: '20px', dur: '6s', delay: '0.8s' },
    { top: '70%', left: '83%', size: '26px', dur: '8s', delay: '2.1s' },
  ];
  const sky = document.querySelector('.sky');
  pins.forEach(({ top, left, size, dur, delay }) => {
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.cssText = `top:${top};left:${left};--ps:${size};--pd:${dur};--pdl:${delay};`;
    pin.innerHTML = `<svg viewBox="0 0 24 30" fill="none" style="width:${size};height:${size};"><path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 21 9 21s9-14.25 9-21c0-4.97-4.03-9-9-9z" fill="#e84c0d"/><circle cx="12" cy="9" r="3.5" fill="#fff"/></svg>`;
    sky.appendChild(pin);
  });
}

// ─────────────────────────────────────────
// FILE UPLOAD
// ─────────────────────────────────────────
const dropZone  = $('drop-zone');
const fileInput = $('file-input');

$('upload-btn').addEventListener('click', () => fileInput.click());
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadFile(file);
});
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
});

function loadFile(file) {
  if (file.size > 10 * 1024 * 1024) {
    alert('File is too large. Please use an image under 10 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    state.src = e.target.result;
    $('preview-img').src = state.src;
    $('upload-view').style.display = 'none';
    $('result-view').style.display = 'block';
    renderOutput();
    analyzeWithAI();
  };
  reader.readAsDataURL(file);
}

// ─────────────────────────────────────────
// STYLE & FORMAT SELECTION
// ─────────────────────────────────────────
document.querySelectorAll('.sty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sty-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.style = btn.dataset.style;
  });
});

document.querySelectorAll('.sz-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sz-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.format = btn.dataset.fmt;
    if (state.src) renderOutput();
  });
});

// ─────────────────────────────────────────
// RENDER OUTPUT IMAGE
// ─────────────────────────────────────────
function renderOutput() {
  const img = new Image();
  img.onload = () => {
    const { w, h, label } = OUTPUT_SIZES[state.format] || OUTPUT_SIZES.passport;
    const canvas = $('out-canvas');
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.width  - sw) / 2;
    const sy = Math.max(0, (img.height - sh) * 0.1);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/png');
    $('output-img').src = dataUrl;
    state.outputDataUrl = dataUrl;
    state.filename = `photo-${label}.png`;
  };
  img.src = state.src;
}

// ─────────────────────────────────────────
// TRAVEL AD — cycles while AI is working
// ─────────────────────────────────────────
function startAd() {
  adIndex = Math.floor(Math.random() * AD_SLIDES.length);
  renderAd();
  adInterval = setInterval(() => {
    adIndex = (adIndex + 1) % AD_SLIDES.length;
    const adEl = document.querySelector('.travel-ad');
    if (adEl) {
      adEl.style.opacity = '0';
      adEl.style.transform = 'translateY(6px)';
      setTimeout(() => {
        renderAd();
        adEl.style.opacity = '1';
        adEl.style.transform = 'translateY(0)';
      }, 300);
    }
  }, 3000);
}

function stopAd() {
  clearInterval(adInterval);
  adInterval = null;
}

function renderAd() {
  const slide = AD_SLIDES[adIndex];
  const eyebrow  = document.querySelector('.ad-eyebrow');
  const headline = document.querySelector('.ad-headline');
  const body     = document.querySelector('.ad-body-txt');
  const cta      = document.querySelector('.ad-cta');
  if (eyebrow)  eyebrow.textContent  = slide.icon + ' ' + slide.headline;
  if (headline) headline.textContent = slide.body;
  if (body)     body.textContent     = slide.body;
  if (cta)      cta.innerHTML        = 'Visit <strong>www.sjiatravels.com</strong> →';
}

// ─────────────────────────────────────────
// AI ANALYSIS — Gemini Vision
// ─────────────────────────────────────────
async function analyzeWithAI() {
  if (state.analyzing) return;
  state.analyzing = true;

  $('proc-row').style.display     = 'block';
  $('analysis-box').style.display = 'none';
  $('dl-btn').style.display       = 'none';

  startAd();

  try {
    const base64   = state.src.split(',')[1];
    const mimeType = state.src.split(';')[0].split(':')[1] || 'image/jpeg';

    const formatLabels = {
      passport: 'passport (35x45 mm)',
      visa:     'visa (2x2 in)',
      id:       'ID card (25x35 mm)',
      square:   'square (1x1 in)',
    };

    const prompt = `Analyze this photo for use as a ${formatLabels[state.format]} ID photo. The person should appear in ${state.style} attire. Reply ONLY with valid JSON, no markdown, no extra text: {"checks":[{"label":"Face visible","status":"pass or warn or fail","note":"one short sentence"},{"label":"Expression","status":"pass or warn or fail","note":"one short sentence"},{"label":"Eyes open","status":"pass or warn or fail","note":"one short sentence"},{"label":"Background","status":"pass or warn or fail","note":"one short sentence"},{"label":"Lighting","status":"pass or warn or fail","note":"one short sentence"},{"label":"Head framing","status":"pass or warn or fail","note":"one short sentence"}]}`;

    const apiKey = window.GEMINI_API_KEY || '';
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('no_key');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: prompt },
          ]}],
          generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
        }),
      }
    );

    if (!response.ok) throw new Error(`api_${response.status}`);

    const data  = await response.json();
    const text  = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    renderChecks(parsed.checks);

  } catch (err) {
    const isNoKey = err.message === 'no_key';
    renderChecks([{
      label: isNoKey ? 'API key not set' : 'AI analysis unavailable',
      status: 'warn',
      note: isNoKey
        ? 'Add your Gemini API key to config.js to enable AI checks.'
        : 'Your image is still ready to download.',
    }]);
  } finally {
    state.analyzing = false;
    stopAd();
    $('proc-row').style.display     = 'none';
    $('analysis-box').style.display = 'block';
    $('dl-btn').style.display       = 'flex';
  }
}

function renderChecks(checks) {
  const icons = { pass: '✓', warn: '!', fail: '✗' };
  $('check-list').innerHTML = checks.map(c => `
    <div class="check-item">
      <div class="check-dot ${c.status}">${icons[c.status] || '?'}</div>
      <span><span class="check-label">${c.label}</span> — ${c.note}</span>
    </div>
  `).join('');
}

// ─────────────────────────────────────────
// DOWNLOAD — no gate, instant
// ─────────────────────────────────────────
$('dl-btn').addEventListener('click', () => {
  if (!state.outputDataUrl) return;
  const a = document.createElement('a');
  a.href     = state.outputDataUrl;
  a.download = state.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// ─────────────────────────────────────────
// RESET
// ─────────────────────────────────────────
$('reset-btn').addEventListener('click', resetApp);

function resetApp() {
  stopAd();
  state.src           = null;
  state.outputDataUrl = null;
  state.analyzing     = false;

  fileInput.value = '';
  $('preview-img').src   = '';
  $('output-img').src    = '';
  $('check-list').innerHTML = '';

  $('analysis-box').style.display = 'none';
  $('dl-btn').style.display       = 'none';
  $('proc-row').style.display     = 'none';

  $('result-view').style.display = 'none';
  $('upload-view').style.display = 'block';

  document.querySelectorAll('.sz-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.sz-btn[data-fmt="passport"]').classList.add('active');
  state.format = 'passport';
}
