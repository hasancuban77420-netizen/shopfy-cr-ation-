'use strict';

// ── PRODUCT DATA ────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: 'Noir Absolu',    category: 'Homme', price: 120, notes: 'Bois de cèdre · Cuir · Vétiver' },
  { id: 2, name: 'Titan',          category: 'Homme', price: 95,  notes: 'Bergamote · Poivre noir · Musc' },
  { id: 3, name: "L'Homme Libre",  category: 'Homme', price: 145, notes: 'Santal · Ambre · Encens' },
  { id: 4, name: 'Rose Noire',     category: 'Femme', price: 135, notes: 'Rose de Damas · Oud · Patchouli' },
  { id: 5, name: 'Éclat Blanc',    category: 'Femme', price: 110, notes: 'Jasmin · Ylang-ylang · Vanille' },
  { id: 6, name: 'La Femme',       category: 'Femme', price: 160, notes: 'Iris · Vétiver blanc · Musc' },
];

// ── CART STATE ───────────────────────────────────────────────
let cart = [];

function getProduct(id) {
  return PRODUCTS.find(p => p.id === Number(id));
}

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  updateCartCounter();
  showToast(`${product.name} ajouté au panier`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== Number(id));
  renderCart();
  updateCartCounter();
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ── CART UI ─────────────────────────────────────────────────
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartFooterEl = document.getElementById('cartFooter');
const cartTotalEl = document.getElementById('cartTotal');
const cartCounterEl = document.getElementById('cartCounter');

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

function updateCartCounter() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCounterEl.textContent = total;
  cartCounterEl.classList.add('bump');
  setTimeout(() => cartCounterEl.classList.remove('bump'), 300);
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide.</p>';
    cartFooterEl.style.display = 'none';
    return;
  }
  cartFooterEl.style.display = 'block';
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__cat">${item.category} &bull; Qté: ${item.qty}</p>
        <p class="cart-item__price">${item.price * item.qty}€</p>
        <button class="cart-item__remove" data-id="${item.id}">Retirer</button>
      </div>
    </div>
  `).join('');
  cartTotalEl.textContent = `${calculateTotal()}€`;

  cartItemsEl.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

// ── CART EVENTS ─────────────────────────────────────────────
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => addToCart(btn.dataset.id));
});

// ── TOAST ────────────────────────────────────────────────────
const toastEl = document.getElementById('toast');
let toastTimeout;

function showToast(message) {
  clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.classList.add('show');
  toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

// ── MOBILE MENU ──────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── STICKY HEADER ────────────────────────────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

// ── SCROLL ANIMATIONS ─────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// ── SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── NEWSLETTER ────────────────────────────────────────────────
const newsletterForm = document.getElementById('newsletterForm');
const newsletterSuccess = document.getElementById('newsletterSuccess');

newsletterForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = this.querySelector('input[type="email"]').value;
  if (!email || !email.includes('@')) return;
  newsletterForm.style.display = 'none';
  newsletterSuccess.classList.add('visible');
});

// ── CUSTOM CURSOR ────────────────────────────────────────────
(function() {
  if (window.matchMedia('(max-width: 768px)').matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
  });
})();
