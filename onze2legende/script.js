'use strict';

/* ── JERSEY DATA ──────────────────────────────────────────── */
const JERSEYS = {
  1:  { body:'#0B1B42', sleeve:'#0B1B42', cuff:'#E1122B', collar:'#FFFFFF', text:'#FFFFFF', num:'10', name:'MBAPPÉ',    code:'FRA', stars:2, starCol:'#D4AF37', pattern:'diag-fra' },
  2:  { body:'#F0F0F0', sleeve:'#F0F0F0', cuff:'#E1122B', collar:'#0B1B42', text:'#0B1B42', num:'7',  name:'GRIEZMANN', code:'FRA', stars:2, starCol:'#D4AF37', pattern:'diag-fra' },
  3:  { body:'#F7D000', sleeve:'#F7D000', cuff:'#009C3B', collar:'#009C3B', text:'#003087', num:'10', name:'VINI JR',   code:'BRA', stars:5, starCol:'#003087' },
  4:  { body:'#74ACDF', sleeve:'#74ACDF', cuff:'#74ACDF', collar:'#74ACDF', text:'#0A2A66', num:'10', name:'MESSI',     code:'ARG', stars:3, starCol:'#FFD24A', pattern:'stripes-ar' },
  5:  { body:'#C60B1E', sleeve:'#C60B1E', cuff:'#F1BF00', collar:'#F1BF00', text:'#FFFFFF', num:'19', name:'YAMAL',     code:'ESP', stars:1, starCol:'#F1BF00' },
  6:  { body:'#C4161C', sleeve:'#C4161C', cuff:'#006600', collar:'#006600', text:'#FFE14A', num:'7',  name:'RONALDO',   code:'POR', stars:0, starCol:'#FFE14A' },
  7:  { body:'#C1272D', sleeve:'#C1272D', cuff:'#006633', collar:'#006633', text:'#FFFFFF', num:'2',  name:'HAKIMI',    code:'MAR', stars:0, starCol:'#FFD24A' },
  8:  { body:'#EFEFEF', sleeve:'#EFEFEF', cuff:'#1A1A1A', collar:'#1A1A1A', text:'#1A1A1A', num:'10', name:'MUSIALA',   code:'GER', stars:4, starCol:'#1A1A1A' },
  9:  { body:'#F5F5F5', sleeve:'#F5F5F5', cuff:'#CF081F', collar:'#CF081F', text:'#0A1F5C', num:'10', name:'BELLINGHAM',code:'ENG', stars:1, starCol:'#CF081F' },
  10: { body:'#1B4FA0', sleeve:'#1B4FA0', cuff:'#FFFFFF', collar:'#FFFFFF', text:'#FFFFFF', num:'14', name:'CHIESA',    code:'ITA', stars:4, starCol:'#FFD24A' },
};

/* ── COLOR HELPER ─────────────────────────────────────────── */
let _svgUID = 0;
function shadeColor(hex, p) {
  hex = (hex || '#cccccc').replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  let r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
  const t = p < 0 ? 0 : 255, a = Math.abs(p);
  r = Math.round((t-r)*a + r); g = Math.round((t-g)*a + g); b = Math.round((t-b)*a + b);
  const h = v => v.toString(16).padStart(2,'0');
  return '#' + h(r) + h(g) + h(b);
}

/* ── BUILD JERSEY SVG ─────────────────────────────────────── */
function buildJerseySVG(id, cssClass) {
  const j = JERSEYS[id];
  if (!j) return '';
  const uid  = 'js' + (_svgUID++);
  const cls  = cssClass || 'jersey-svg';
  const base = j.body || '#cccccc';
  const slBase = j.sleeve || base;
  const sc   = j.starCol || '#FFD24A';
  const tc   = j.text    || '#ffffff';
  const sl   = (hex, p) => shadeColor(hex, p);

  /* ── DEFS ── */
  let defs = `
    <linearGradient id="bg_${uid}" x1="0.18" y1="0" x2="0.82" y2="1">
      <stop offset="0%"   stop-color="${sl(base,  0.22)}"/>
      <stop offset="42%"  stop-color="${base}"/>
      <stop offset="100%" stop-color="${sl(base, -0.28)}"/>
    </linearGradient>
    <linearGradient id="slg_${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${sl(slBase,  0.16)}"/>
      <stop offset="100%" stop-color="${sl(slBase, -0.32)}"/>
    </linearGradient>
    <filter id="sh_${uid}" x="-28%" y="-12%" width="156%" height="148%">
      <feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#000" flood-opacity="0.52"/>
    </filter>`;

  let bodyFill   = `url(#bg_${uid})`;
  let sleeveFill = `url(#slg_${uid})`;

  /* ── NATION PATTERNS ── */
  if (j.pattern === 'stripes-ar') {
    defs += `<pattern id="par_${uid}" width="16" height="1" patternUnits="userSpaceOnUse">
      <rect width="16" height="1" fill="#fff"/>
      <rect width="8"  height="1" fill="#74ACDF"/>
    </pattern>`;
    bodyFill = sleeveFill = `url(#par_${uid})`;
  }
  if (j.pattern === 'diag-fra') {
    const isLight = parseInt(base.replace('#','').slice(0,2), 16) > 180;
    const stripe  = isLight ? sl(base, -0.09) : sl(base, 0.10);
    defs += `<pattern id="pdia_${uid}" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45 100 120)">
      <rect width="20" height="20" fill="${base}"/>
      <rect width="10" height="20" fill="${stripe}"/>
    </pattern>`;
    bodyFill = sleeveFill = `url(#pdia_${uid})`;
  }

  /* ── PATHS (viewBox 0 0 200 240) ── */
  const body    = 'M62,40 L40,78 L44,230 Q44,237 53,237 L147,237 Q156,237 156,230 L160,78 L138,40 L100,56 Z';
  const sleeveL = 'M62,40 L24,22 L4,72 L40,78 Z';
  const sleeveR = 'M138,40 L176,22 L196,72 L160,78 Z';
  const cuffL   = 'M4,72 L24,22 L30,27 L10,76 Z';
  const cuffR   = 'M196,72 L176,22 L170,27 L190,76 Z';
  const colO    = 'M62,40 Q100,24 138,40 L100,56 Z';
  const colI    = 'M74,41 Q100,28 126,41 L100,52 Z';

  /* ── DETAIL POSITIONS ── */
  const bx = 132, by = 90, br = 13;   // badge: right chest
  const swx = 68, swy = 90;           // swoosh: left chest
  const stY = by - br - 4;            // stars just above badge

  /* ── STARS ── */
  const ns = Math.min(j.stars || 0, 5);
  let starsHTML = '';
  if (ns > 0) {
    const fs   = ns >= 4 ? 7 : 9;
    const gap  = ns >= 4 ? 9 : 12;
    const stX0 = bx - (ns * gap) / 2 + gap / 2;
    for (let i = 0; i < ns; i++) {
      starsHTML += `<text x="${stX0 + i * gap}" y="${stY}" text-anchor="middle" fill="${sc}" font-family="serif" font-size="${fs}">★</text>`;
    }
  }

  /* ── NIKE SWOOSH (left chest) ── */
  const swoosh = `<path d="M${swx-9},${swy+5} C${swx+3},${swy-8} ${swx+17},${swy-1} ${swx+15},${swy+6} C${swx+11},${swy+11} ${swx-1},${swy+7} ${swx-9},${swy+5} Z" fill="${sc}" opacity="0.88"/>`;

  /* ── BADGE (right chest) ── */
  const badge = `<circle cx="${bx}" cy="${by}" r="${br}" fill="${sc}" opacity="0.90"/>
    <text x="${bx}" y="${by+4}" text-anchor="middle" fill="${base}" font-family="Inter,sans-serif" font-weight="900" font-size="6">${j.code}</text>`;

  /* ── COLLAR ACCENT ── */
  const collarAccent = j.cuff !== j.collar
    ? `<path d="M75,42 Q100,30 125,42 L124,46 Q100,34 76,46 Z" fill="${j.cuff}" opacity="0.80"/>`
    : '';

  /* ── CHEST SHEEN ── */
  const sheen = `<path d="M82,56 Q100,52 118,66 L116,90 Q100,74 80,82 Z" fill="#fff" opacity="0.045"/>`;

  /* ── NAME + NUMBER ── */
  const flocage = `
    <path id="narc_${uid}" d="M40,142 Q100,130 160,142" fill="none"/>
    <text fill="${tc}" font-family="Inter,sans-serif" font-weight="800" font-size="12" letter-spacing="1">
      <textPath href="#narc_${uid}" startOffset="50%" text-anchor="middle">${j.name || j.code}</textPath>
    </text>
    <text x="100" y="213" text-anchor="middle" fill="${tc}" font-family="Inter,sans-serif" font-weight="900" font-size="62" opacity="0.11">${j.num}</text>
    <text x="100" y="213" text-anchor="middle" fill="${tc}" font-family="Inter,sans-serif" font-weight="900" font-size="62">${j.num}</text>`;

  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="${cls}" aria-hidden="true">
  <defs>${defs}</defs>
  <g filter="url(#sh_${uid})">
    <path d="${sleeveL}" fill="${sleeveFill}" stroke="${sl(slBase,-0.28)}" stroke-width="0.5"/>
    <path d="${sleeveR}" fill="${sleeveFill}" stroke="${sl(slBase,-0.28)}" stroke-width="0.5"/>
    <path d="${cuffL}" fill="${j.cuff}"/>
    <path d="${cuffR}" fill="${j.cuff}"/>
    <path d="${body}" fill="${bodyFill}" stroke="${sl(base,-0.28)}" stroke-width="0.5"/>
    ${sheen}
    <path d="${colO}" fill="${j.collar}"/>
    <path d="${colI}" fill="${sl(j.collar,-0.20)}" opacity="0.55"/>
    ${collarAccent}
  </g>
  ${starsHTML}
  ${badge}
  ${swoosh}
  ${flocage}
</svg>`;
}

/* ── PHOTO PATH PAR PRODUIT ───────────────────────────────── */
/* Dépose tes photos dans onze2legende/assets/maillots/ avec ces noms
   exacts. Si le fichier existe, il remplace le maillot dessiné ; sinon
   le SVG reste affiché (repli automatique). */
function imgPathFor(card) {
  const id = card.dataset.id;
  // Versions détourées (fond transparent) -> rendu propre sur fond sombre.
  // Si le fichier -cut n'existe pas, onerror retire la photo => repli SVG.
  if (id === '1') return 'assets/maillots/france-domicile-cut.webp';
  if (id === '2') return 'assets/maillots/france-exterieur-cut.webp';
  return 'assets/maillots/' + card.dataset.nation + '-cut.webp';
}

/* Construit le visuel : SVG dessiné + (si dispo) photo réelle par-dessus.
   onerror retire la photo manquante => le SVG reste visible. */
function jerseyVisual(id, imgPath, svgClass, alt, fit) {
  const svg = buildJerseySVG(id, svgClass);
  if (!imgPath) return svg;
  const fitCls = fit === 'contain' ? ' jersey-photo--contain' : '';
  return `<div class="jersey-photo-wrap">${svg}<img class="jersey-photo${fitCls}" src="${imgPath}" alt="${alt || ''}" loading="lazy" onerror="this.remove()"></div>`;
}

/* ── RENDER ALL CARD JERSEYS ──────────────────────────────── */
function renderCardJerseys() {
  document.querySelectorAll('.product-card[data-id]').forEach(card => {
    const id = card.dataset.id;
    const imgDiv = card.querySelector('.product-card__img');
    if (!imgDiv || imgDiv.querySelector('svg')) return;
    imgDiv.innerHTML = jerseyVisual(id, imgPathFor(card), 'jersey-svg jersey-svg--card', card.dataset.name, 'contain');
    if (card.dataset.badge) {
      const b = document.createElement('span');
      b.className = 'product-card__badge';
      b.textContent = card.dataset.badge;
      imgDiv.appendChild(b);
    }
  });
}

/* ── RENDER HERO ──────────────────────────────────────────── */
/* Tente d'abord la vidéo (Google Flow), repli cinématique sur les photos. */
function renderHeroJersey() {
  const el = document.getElementById('heroJersey');
  if (!el) return;

  const dotsEl  = document.getElementById('heroDots');
  const labelEl = document.getElementById('heroLabel');
  const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const portrait = window.matchMedia('(max-width: 900px)').matches;
  const videoSrc = portrait
    ? 'assets/hero-maillots-portrait.mp4'
    : 'assets/hero-maillots-paysage.mp4';

  let settled = false;
  function fallback() {
    if (settled) return;
    settled = true;
    renderCineCarousel(el, dotsEl, labelEl, reduce);
  }

  const video = document.createElement('video');
  video.className = 'hero-video';
  video.muted = true;
  video.loop = true;
  video.autoplay = !reduce;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = 'auto';
  video.poster = 'assets/maillots/france-domicile-cut.webp';
  video.addEventListener('loadeddata', () => {
    if (settled) return;
    settled = true;
    el.innerHTML = '';
    el.appendChild(video);
    if (dotsEl)  dotsEl.innerHTML = '';
    if (labelEl) labelEl.textContent = 'Collection 2026';
    if (!reduce) video.play().catch(() => {});
  });
  video.addEventListener('error', fallback);
  video.src = videoSrc;
  setTimeout(fallback, 2200);
}

/* ── CINEMATIC HERO (animation CSS-driven multi-scènes) ────── */
function renderCineCarousel(el, dotsEl, labelEl, reduce) {

  /* Scènes : chaque cam donne un mouvement de caméra différent.
     La durée indique combien de temps la scène reste pleinement visible. */
  const SCENES = [
    { src: 'assets/maillots/france-domicile-cut.webp',     cam: 'reveal', dur: 3800, label: 'France · Avant' },
    { src: 'assets/maillots/france-domicile-detail.webp',  cam: 'zoom',   dur: 2900, label: 'France · Détail', framed: true },
    { src: 'assets/maillots/france-domicile-dos-cut.webp', cam: 'pan',    dur: 3800, label: 'France · Dos' },
  ];
  const FADE = 750; // ms de crossfade entre scènes

  el.classList.add('cine-mode');

  /* Construire les éléments DOM */
  const nodes = SCENES.map((s, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'cine-scene';
    wrap.dataset.cam = s.cam;

    const img = document.createElement('img');
    img.className = 'cine-img' + (s.framed ? ' cine-img--framed' : '');
    img.src = s.src;
    img.alt = s.label;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.addEventListener('error', () => wrap.dataset.dead = '1');
    wrap.appendChild(img);
    el.appendChild(wrap);
    return wrap;
  });

  /* Fallback SVG si aucune image ne charge (1.8s) */
  const svgTimer = setTimeout(() => {
    if (!el.querySelector('.cine-scene:not([data-dead])')) {
      el.classList.remove('cine-mode');
      el.innerHTML = buildJerseySVG(1, 'jersey-svg jersey-svg--hero');
      if (dotsEl) dotsEl.innerHTML = '';
    }
  }, 1800);

  /* Petits points indicateurs */
  if (dotsEl) {
    dotsEl.innerHTML = SCENES.map((s, i) =>
      `<button class="hero-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="${s.label}"></button>`
    ).join('');
  }
  const dots = dotsEl ? [...dotsEl.querySelectorAll('.hero-dot')] : [];

  let current = 0, ticker = null;

  /* Redémarre l'animation CSS d'un élément (trick double rAF) */
  function restartAnim(img) {
    img.style.animation = 'none';
    requestAnimationFrame(() => requestAnimationFrame(() => { img.style.animation = ''; }));
  }

  function go(n) {
    clearTimeout(svgTimer);
    clearTimeout(ticker);
    const live = nodes.filter(nd => !nd.dataset.dead);
    if (!live.length) return;

    const prev = live[current % live.length];
    current = ((n % live.length) + live.length) % live.length;
    const next = live[current];

    /* Fade out l'ancien, fade in le nouveau */
    if (prev !== next) prev.classList.remove('active');
    restartAnim(next.querySelector('.cine-img'));
    next.classList.add('active');

    /* Label */
    const scene = SCENES[nodes.indexOf(next)] || SCENES[0];
    if (labelEl) labelEl.textContent = scene.label;

    /* Dots */
    const ni = nodes.indexOf(next);
    dots.forEach((d, i) => d.classList.toggle('active', i === ni));

    /* Auto-avance */
    if (!reduce) ticker = setTimeout(() => go(current + 1), scene.dur + FADE);
  }

  /* Navigation manuelle (dots) */
  dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.i)));
  el.addEventListener('mouseenter', () => clearTimeout(ticker));
  el.addEventListener('mouseleave', () => {
    if (!reduce) {
      const scene = SCENES[nodes.indexOf(nodes.filter(nd=>!nd.dataset.dead)[current])] || SCENES[0];
      ticker = setTimeout(() => go(current + 1), scene.dur);
    }
  });

  go(0);
}


/* ── FRANCE SHOWCASE ──────────────────────────────────────── */
function renderFranceShowcase() {
  const el = document.getElementById('franceShowcase');
  if (!el) return;
  el.innerHTML = `
    <div style="transform:rotate(-6deg) translateY(10px)">${buildJerseySVG(1,'jersey-svg jersey-svg--france-show')}</div>
    <div style="transform:rotate(4deg)">${buildJerseySVG(2,'jersey-svg jersey-svg--france-show')}</div>`;
}

/* ── UNIVERS VISUAL ───────────────────────────────────────── */
function renderUniversVisual() {
  const el = document.getElementById('universVisual');
  if (!el) return;
  el.innerHTML = `<div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;align-items:center;padding:1.5rem;">
    ${[3,4,5].map(id => `<div style="width:78px">${buildJerseySVG(id,'jersey-svg')}</div>`).join('')}
  </div>`;
}

/* ── CART STATE ───────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('o2l-cart') || '[]');

function saveCart() { localStorage.setItem('o2l-cart', JSON.stringify(cart)); }

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id && i.size === product.size);
  if (existing) { existing.qty += 1; }
  else { cart.push({ ...product, qty: 1 }); }
  saveCart(); renderCart(); updateCartCount();
  showToast(`${product.name} (${product.size}) ajouté !`);
}

function removeFromCart(id, size) {
  cart = cart.filter(i => !(i.id === id && i.size === size));
  saveCart(); renderCart(); updateCartCount();
}

function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = total;
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');
  if (!itemsEl) return;
  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Ton panier est vide.</p>';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }
  if (footerEl) footerEl.style.display = 'block';
  if (totalEl) totalEl.textContent = cartTotal() + '€';
  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__svg-wrap">${buildJerseySVG(item.id, 'jersey-svg')}</div>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__meta">Taille : ${item.size} · Qté : ${item.qty}</p>
        <p class="cart-item__price">${item.price * item.qty}€</p>
        <button class="cart-item__remove" data-id="${item.id}" data-size="${item.size}">Retirer</button>
      </div>
    </div>`).join('');
  itemsEl.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id, btn.dataset.size));
  });
}

/* ── CART OPEN/CLOSE ──────────────────────────────────────── */
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('cartBtn')?.addEventListener('click', openCart);
document.getElementById('cartClose')?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

/* ── SIZE MODAL ───────────────────────────────────────────── */
let currentProduct = null;
let selectedSize = null;

function openModal(card) {
  currentProduct = {
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseInt(card.dataset.price),
    nation: card.dataset.nationLabel || card.dataset.nation,
    img: imgPathFor(card),
  };
  selectedSize = null;
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalName').textContent = currentProduct.name;
  document.getElementById('modalNation').textContent = currentProduct.nation;
  document.getElementById('modalPrice').textContent = currentProduct.price + '€';
  const wrap = document.getElementById('modalJerseyWrap');
  if (wrap) wrap.innerHTML = jerseyVisual(currentProduct.id, currentProduct.img, 'jersey-svg', currentProduct.name, 'contain');
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('confirmAdd').disabled = true;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modalOverlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

/* Carte cliquable → fiche produit (avant + arrière) */
document.querySelectorAll('.product-card[data-id]').forEach(card => {
  const id = card.dataset.id;
  const go = () => { location.href = 'produit.html?id=' + id; };
  const img = card.querySelector('.product-card__img');
  const name = card.querySelector('.product-card__name');
  if (img) { img.style.cursor = 'pointer'; img.addEventListener('click', go); }
  if (name) { name.style.cursor = 'pointer'; name.addEventListener('click', go); }
  const btn = card.querySelector('.size-trigger');
  if (btn) { btn.textContent = 'Voir le produit'; btn.addEventListener('click', go); }
});

document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSize = btn.dataset.size;
    document.getElementById('confirmAdd').disabled = false;
  });
});

document.getElementById('confirmAdd')?.addEventListener('click', () => {
  if (!currentProduct || !selectedSize) return;
  addToCart({ ...currentProduct, size: selectedSize });
  closeModal();
  openCart();
});

/* ── FILTER SYSTEM ────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      const match = filter === 'all' || card.dataset.nation === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

/* ── FILTER CTA (France section) ──────────────────────────── */
document.querySelectorAll('.filter-cta').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    const targetBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (targetBtn) targetBtn.click();
    const collectionEl = document.getElementById('collection');
    if (collectionEl) {
      const topbar = document.getElementById('topbar');
      const offset = topbar ? topbar.offsetHeight : 0;
      window.scrollTo({ top: collectionEl.getBoundingClientRect().top + window.scrollY - offset - 20, behavior: 'smooth' });
    }
  });
});

/* ── SCROLL ANIMATIONS ────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.animate-scroll').forEach(el => observer.observe(el));

/* ── SMOOTH SCROLL ────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = (document.getElementById('topbar') || { offsetHeight: 0 }).offsetHeight;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset - 10, behavior: 'smooth' });
    }
  });
});

/* ── HAMBURGER ────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});
nav?.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── NEWSLETTER ───────────────────────────────────────────── */
document.getElementById('newsletterForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  this.style.display = 'none';
  const success = document.getElementById('newsletterSuccess');
  if (success) success.classList.add('visible');
});

/* ── TOAST ────────────────────────────────────────────────── */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

/* ── INIT ─────────────────────────────────────────────────── */
renderHeroJersey();
renderCardJerseys();
renderFranceShowcase();
renderUniversVisual();
renderCart();
updateCartCount();
