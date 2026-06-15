'use strict';

/* ── JERSEY DATA ──────────────────────────────────────────── */
const JERSEYS = {
  1:  { body:'#13235B', sleeve:'#13235B', cuff:'#E1122B', collar:'#FFFFFF', text:'#FFFFFF', num:'10', name:'MBAPPÉ',    code:'FRA', stars:2, starCol:'#FFD24A' },
  2:  { body:'#FFFFFF', sleeve:'#FFFFFF', cuff:'#E1122B', collar:'#13235B', text:'#13235B', num:'7',  name:'GRIEZMANN', code:'FRA', stars:2, starCol:'#13235B' },
  3:  { body:'#FFD800', sleeve:'#FFD800', cuff:'#009C3B', collar:'#009C3B', text:'#002776', num:'10', name:'VINI JR',   code:'BRA', stars:5, starCol:'#002776' },
  4:  { body:null,      sleeve:null,      cuff:'#75AADB', collar:'#75AADB', text:'#0A2A66', num:'10', name:'MESSI',     code:'ARG', stars:3, starCol:'#FFD24A', pattern:'stripes-ar' },
  5:  { body:'#C60B1E', sleeve:'#C60B1E', cuff:'#F1BF00', collar:'#F1BF00', text:'#FFFFFF', num:'19', name:'YAMAL',     code:'ESP', stars:1, starCol:'#FFD24A' },
  6:  { body:'#C4161C', sleeve:'#C4161C', cuff:'#0B6E33', collar:'#0B6E33', text:'#FFE14A', num:'7',  name:'RONALDO',   code:'POR', stars:0, starCol:'#FFD24A' },
  7:  { body:'#C1272D', sleeve:'#C1272D', cuff:'#0A6B3B', collar:'#0A6B3B', text:'#FFFFFF', num:'2',  name:'HAKIMI',    code:'MAR', stars:0, starCol:'#FFD24A' },
  8:  { body:'#FFFFFF', sleeve:'#FFFFFF', cuff:'#1A1A1A', collar:'#1A1A1A', text:'#1A1A1A', num:'10', name:'MUSIALA',   code:'GER', stars:4, starCol:'#1A1A1A' },
  9:  { body:'#FFFFFF', sleeve:'#FFFFFF', cuff:'#CF081F', collar:'#CF081F', text:'#0A1F5C', num:'10', name:'BELLINGHAM',code:'ENG', stars:1, starCol:'#CF081F' },
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

/* ── BUILD JERSEY SVG (réaliste, flocage nom + numéro) ─────── */
function buildJerseySVG(id, cssClass) {
  const j = JERSEYS[id];
  if (!j) return '';
  const uid = 'js' + (_svgUID++);
  const cls = cssClass || 'jersey-svg';
  const base = j.body || '#ffffff';
  const top = shadeColor(base, 0.16);
  const bot = shadeColor(base, -0.16);
  const edge = shadeColor(base, -0.30);
  const stars = '★'.repeat(j.stars || 0);
  const name = j.name || j.code;

  let bodyFill = `url(#grad_${uid})`;
  let sleeveFill = `url(#sgr_${uid})`;

  let defs = `
    <linearGradient id="grad_${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${top}"/>
      <stop offset="48%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${bot}"/>
    </linearGradient>
    <linearGradient id="sgr_${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${shadeColor(j.sleeve || base, 0.10)}"/>
      <stop offset="100%" stop-color="${shadeColor(j.sleeve || base, -0.22)}"/>
    </linearGradient>
    <filter id="sh_${uid}" x="-30%" y="-20%" width="160%" height="155%">
      <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#000" flood-opacity="0.45"/>
    </filter>`;

  if (j.pattern === 'stripes-ar') {
    defs += `<pattern id="pat_${uid}" width="26" height="12" patternUnits="userSpaceOnUse">
      <rect width="26" height="12" fill="#ffffff"/>
      <rect width="13" height="12" fill="#75AADB"/>
    </pattern>`;
    bodyFill = `url(#pat_${uid})`;
    sleeveFill = `url(#pat_${uid})`;
  }

  const sleeveL = 'M64,32 L30,22 L10,60 L42,64 Z';
  const sleeveR = 'M136,32 L170,22 L190,60 L158,64 Z';
  const cuffL = 'M10,60 L30,22 L36,25 L16,63 Z';
  const cuffR = 'M190,60 L170,22 L164,25 L184,63 Z';
  const bodyPath = 'M64,32 L42,64 L50,198 Q50,206 58,206 L142,206 Q150,206 150,198 L158,64 L136,32 L100,54 Z';
  const collarOuter = 'M64,32 Q100,20 136,32 L100,54 Z';
  const collarInner = 'M73,33 Q100,24 127,33 L100,47 Z';

  return `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" class="${cls}">
  <defs>${defs}</defs>
  <g filter="url(#sh_${uid})">
    <path d="${sleeveL}" fill="${sleeveFill}" stroke="${edge}" stroke-width="0.5"/>
    <path d="${sleeveR}" fill="${sleeveFill}" stroke="${edge}" stroke-width="0.5"/>
    <path d="${cuffL}" fill="${j.cuff}"/>
    <path d="${cuffR}" fill="${j.cuff}"/>
    <path d="${bodyPath}" fill="${bodyFill}" stroke="${edge}" stroke-width="0.6"/>
    <path d="M100,54 L86,202 L114,202 Z" fill="#ffffff" opacity="0.05"/>
    <path d="${collarOuter}" fill="${j.collar}"/>
    <path d="${collarInner}" fill="${shadeColor(j.collar, -0.18)}" opacity="0.55"/>
  </g>
  ${stars ? `<text x="100" y="80" text-anchor="middle" fill="${j.starCol}" font-family="serif" font-size="11" letter-spacing="2">${stars}</text>` : ''}
  <path id="arc_${uid}" d="M58,110 Q100,98 142,110" fill="none"/>
  <text fill="${j.text}" font-family="Inter,sans-serif" font-weight="800" font-size="13" letter-spacing="1">
    <textPath href="#arc_${uid}" startOffset="50%" text-anchor="middle">${name}</textPath>
  </text>
  <text x="101" y="178" text-anchor="middle" fill="${shadeColor(j.text, -0.25)}" font-family="Inter,sans-serif" font-weight="900" font-size="54" opacity="0.45">${j.num}</text>
  <text x="100" y="176" text-anchor="middle" fill="${j.text}" font-family="Inter,sans-serif" font-weight="900" font-size="54">${j.num}</text>
</svg>`;
}

/* ── PHOTO PATH PAR PRODUIT ───────────────────────────────── */
/* Dépose tes photos dans onze2legende/assets/maillots/ avec ces noms
   exacts. Si le fichier existe, il remplace le maillot dessiné ; sinon
   le SVG reste affiché (repli automatique). */
function imgPathFor(card) {
  const id = card.dataset.id;
  if (id === '1') return 'assets/maillots/france-domicile.webp';
  if (id === '2') return 'assets/maillots/france-exterieur.webp';
  return 'assets/maillots/' + card.dataset.nation + '.webp';
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
    imgDiv.innerHTML = jerseyVisual(id, imgPathFor(card), 'jersey-svg jersey-svg--card', card.dataset.name, 'cover');
    if (card.dataset.badge) {
      const b = document.createElement('span');
      b.className = 'product-card__badge';
      b.textContent = card.dataset.badge;
      imgDiv.appendChild(b);
    }
  });
}

/* ── RENDER HERO JERSEY ───────────────────────────────────── */
function renderHeroJersey() {
  const el = document.getElementById('heroJersey');
  if (!el) return;
  const frames = [
    { img: 'assets/maillots/france-domicile-cut.webp',     label: 'Avant' },
    { img: 'assets/maillots/france-domicile-dos-cut.webp', label: 'Dos' },
    { img: 'assets/maillots/france-domicile-detail.webp',  label: 'Détail', frame: true },
  ];
  el.innerHTML = frames.map((f, i) =>
    `<img class="hero-shot${i === 0 ? ' active' : ''}${f.frame ? ' hero-shot--framed' : ''}" src="${f.img}" alt="Maillot France ${f.label}" data-label="${f.label}" onerror="this.dataset.failed='1';this.remove()">`
  ).join('');

  const dotsEl = document.getElementById('heroDots');
  const labelEl = document.getElementById('heroLabel');
  const shots = [...el.querySelectorAll('.hero-shot')];

  // Repli : si aucune photo ne charge, on retombe sur le maillot dessiné.
  setTimeout(() => {
    if (!el.querySelector('.hero-shot')) {
      el.innerHTML = buildJerseySVG(1, 'jersey-svg jersey-svg--hero');
      if (dotsEl) dotsEl.innerHTML = '';
    }
  }, 1500);

  if (dotsEl) {
    dotsEl.innerHTML = shots.map((s, i) =>
      `<button class="hero-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Vue ${s.dataset.label}"></button>`
    ).join('');
  }
  const dots = dotsEl ? [...dotsEl.querySelectorAll('.hero-dot')] : [];

  let idx = 0, timer = null;
  function go(n) {
    idx = (n + shots.length) % shots.length;
    shots.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (labelEl) labelEl.textContent = 'France Domicile · ' + shots[idx].dataset.label;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function start() { if (!reduce && shots.length > 1) timer = setInterval(() => go(idx + 1), 3200); }
  function stop() { clearInterval(timer); timer = null; }
  dots.forEach(d => d.addEventListener('click', () => { go(+d.dataset.i); stop(); start(); }));
  el.addEventListener('mouseenter', stop);
  el.addEventListener('mouseleave', start);
  go(0); start();
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
