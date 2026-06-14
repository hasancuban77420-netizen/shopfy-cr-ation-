'use strict';

/* ── JERSEY DATA ──────────────────────────────────────────── */
const JERSEYS = {
  1:  { body:'#00209F', sleeve:'#00209F', cuff:'#EF3340', collar:'#FFFFFF', text:'#FFFFFF', num:'10', code:'FRA', stars:2, starCol:'#FFD700', cuffAccent:'#EF3340' },
  2:  { body:'#FFFFFF', sleeve:'#FFFFFF', cuff:'#EF3340', collar:'#00209F', text:'#00209F', num:'9',  code:'FRA', stars:2, starCol:'#00209F', cuffAccent:'#EF3340' },
  3:  { body:'#FFD700', sleeve:'#FFD700', cuff:'#009C3B', collar:'#009C3B', text:'#002776', num:'10', code:'BRA', stars:5, starCol:'#002776' },
  4:  { body:null, sleeve:null, cuff:'#74ACDF', collar:'#74ACDF', text:'#002868', num:'10', code:'ARG', stars:3, starCol:'#FFD700', pattern:'stripes-ar' },
  5:  { body:'#C60B1E', sleeve:'#C60B1E', cuff:'#F1BF00', collar:'#F1BF00', text:'#FFFFFF', num:'10', code:'ESP', stars:1, starCol:'#FFD700' },
  6:  { body:'#C4161C', sleeve:'#C4161C', cuff:'#006600', collar:'#006600', text:'#FFFFFF', num:'7',  code:'POR', stars:0, starCol:'#FFD700' },
  7:  { body:'#C1272D', sleeve:'#C1272D', cuff:'#006233', collar:'#006233', text:'#FFFFFF', num:'22', code:'MAR', stars:0, starCol:'#FFD700' },
  8:  { body:'#FFFFFF', sleeve:'#FFFFFF', cuff:'#1a1a1a', collar:'#1a1a1a', text:'#1a1a1a', num:'8',  code:'GER', stars:4, starCol:'#1a1a1a' },
  9:  { body:'#FFFFFF', sleeve:'#FFFFFF', cuff:'#CF081F', collar:'#CF081F', text:'#CF081F', num:'9',  code:'ENG', stars:1, starCol:'#CF081F' },
  10: { body:'#003DA5', sleeve:'#003DA5', cuff:'#FFFFFF', collar:'#FFFFFF', text:'#FFFFFF', num:'10', code:'ITA', stars:4, starCol:'#FFD700' },
};

/* ── BUILD JERSEY SVG ─────────────────────────────────────── */
function buildJerseySVG(id, cssClass) {
  const j = JERSEYS[id];
  if (!j) return '';
  const uid = `j${id}_${Math.random().toString(36).slice(2,6)}`;
  const starsStr = '★'.repeat(j.stars);
  const cls = cssClass || 'jersey-svg';

  let bodyParts = '';
  if (j.pattern === 'stripes-ar') {
    bodyParts = `
    <defs>
      <pattern id="sp_${uid}" x="0" y="0" width="22" height="200" patternUnits="userSpaceOnUse">
        <rect x="0"  y="0" width="11" height="200" fill="#74ACDF"/>
        <rect x="11" y="0" width="11" height="200" fill="#ffffff"/>
      </pattern>
      <mask id="sm_${uid}">
        <path d="M58,28 L30,58 L30,186 L150,186 L150,58 L122,28 L90,52 Z" fill="white"/>
        <path d="M28,14 L5,50 L30,58 L58,28 Z" fill="white"/>
        <path d="M152,14 L175,50 L150,58 L122,28 Z" fill="white"/>
      </mask>
    </defs>
    <rect x="0" y="0" width="180" height="200" fill="url(#sp_${uid})" mask="url(#sm_${uid})"/>`;
  } else {
    bodyParts = `
    <path d="M58,28 L30,58 L30,186 L150,186 L150,58 L122,28 L90,52 Z" fill="${j.body}"/>
    <path d="M28,14 L5,50 L30,58 L58,28 Z" fill="${j.sleeve}"/>
    <path d="M152,14 L175,50 L150,58 L122,28 Z" fill="${j.sleeve}"/>`;
  }

  const cuffPart = j.cuff ? `
    <path d="M5,50 L28,14 L34,17 L11,53 Z" fill="${j.cuff}"/>
    <path d="M175,50 L152,14 L146,17 L169,53 Z" fill="${j.cuff}"/>` : '';

  return `<svg viewBox="0 0 180 200" xmlns="http://www.w3.org/2000/svg" class="${cls}">
  ${bodyParts}
  ${cuffPart}
  <path d="M58,28 Q74,18 90,16 Q106,18 122,28 L90,52 Z" fill="${j.collar}"/>
  ${starsStr ? `<text x="69" y="68" fill="${j.starCol}" font-family="serif" font-size="9" letter-spacing="3">${starsStr}</text>` : ''}
  <circle cx="68" cy="82" r="8" fill="${j.collar}" opacity="0.18" stroke="${j.text}" stroke-width="0.6"/>
  <text x="90" y="148" text-anchor="middle" fill="${j.text}" font-family="'Inter',sans-serif" font-weight="800" font-size="11" letter-spacing="4">${j.code}</text>
  <text x="90" y="174" text-anchor="middle" fill="${j.text}" font-family="'Inter',sans-serif" font-weight="900" font-size="26">${j.num}</text>
</svg>`;
}

/* ── RENDER ALL CARD JERSEYS ──────────────────────────────── */
function renderCardJerseys() {
  document.querySelectorAll('.product-card[data-id]').forEach(card => {
    const id = card.dataset.id;
    const imgDiv = card.querySelector('.product-card__img');
    if (!imgDiv || imgDiv.querySelector('svg')) return;
    imgDiv.innerHTML = buildJerseySVG(id, 'jersey-svg jersey-svg--card');
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
  if (el) el.innerHTML = buildJerseySVG(1, 'jersey-svg jersey-svg--hero');
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
    ${[3,4,5].map(id => `<div style="width:72px">${buildJerseySVG(id,'jersey-svg')}</div>`).join('')}
  </div>`;
}

/* ── CART STATE ───────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('o2l-cart') || '[]');

function saveCart() { localStorage.setItem('o2l-cart', JSON.stringify(cart)); }

function addToCart(product) {
  const key = `${product.id}-${product.size}`;
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
  };
  selectedSize = null;
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalName').textContent = currentProduct.name;
  document.getElementById('modalNation').textContent = currentProduct.nation;
  document.getElementById('modalPrice').textContent = currentProduct.price + '€';
  const wrap = document.getElementById('modalJerseyWrap');
  if (wrap) wrap.innerHTML = buildJerseySVG(currentProduct.id, 'jersey-svg');
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

document.querySelectorAll('.size-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    openModal(card);
  });
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
