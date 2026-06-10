// ─── Product data ───
const PRODUCTS = {
  1: { id: 1, name: 'Noir Absolu',    price: 120, gender: 'Homme' },
  2: { id: 2, name: 'Titan',          price: 95,  gender: 'Homme' },
  3: { id: 3, name: "L'Homme Libre",  price: 145, gender: 'Homme' },
  4: { id: 4, name: 'Rose Noire',     price: 135, gender: 'Femme' },
  5: { id: 5, name: 'Éclat Blanc',    price: 110, gender: 'Femme' },
  6: { id: 6, name: 'La Femme',       price: 160, gender: 'Femme' },
};

// ─── Cart state ───
let cart = {};

// ─── DOM refs ───
const cartToggle    = document.getElementById('cartToggle');
const cartClose     = document.getElementById('cartClose');
const cartOverlay   = document.getElementById('cartOverlay');
const cartSidebar   = document.getElementById('cartSidebar');
const cartCounter   = document.getElementById('cartCounter');
const cartItems     = document.getElementById('cartItems');
const cartEmpty     = document.getElementById('cartEmpty');
const cartTotal     = document.getElementById('cartTotal');
const cartFooter    = document.getElementById('cartFooter');
const hamburger     = document.getElementById('hamburger');
const nav           = document.getElementById('nav');
const header        = document.getElementById('header');
const newsletterForm = document.getElementById('newsletterForm');
const newsletterSuccess = document.getElementById('newsletterSuccess');

// ─── Cart: open / close ───
function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ─── Cart: add item ───
function addToCart(id) {
  const product = PRODUCTS[id];
  if (!product) return;
  if (cart[id]) {
    cart[id].qty += 1;
  } else {
    cart[id] = { ...product, qty: 1 };
  }
  renderCart();
  openCart();
  animateCartIcon();
}

// ─── Cart: update qty ───
function updateQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  renderCart();
}

// ─── Cart: remove item ───
function removeFromCart(id) {
  delete cart[id];
  renderCart();
}

// ─── Cart: render ───
function renderCart() {
  const items = Object.values(cart);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  cartCounter.textContent = count;
  cartCounter.style.display = count > 0 ? 'flex' : 'none';

  if (items.length === 0) {
    cartItems.innerHTML = '';
    cartItems.appendChild(cartEmpty);
    cartEmpty.style.display = 'block';
    cartFooter.style.display = 'none';
    return;
  }

  cartEmpty.style.display = 'none';
  cartFooter.style.display = 'block';
  cartTotal.textContent = total + ' €';

  cartItems.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">${item.price} €</p>
        <div class="cart-item__qty">
          <button onclick="updateQty(${item.id}, -1)" aria-label="Diminuer">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${item.id}, 1)" aria-label="Augmenter">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart(${item.id})" aria-label="Supprimer">✕</button>
    </div>
  `).join('');
}

// ─── Cart icon bounce ───
function animateCartIcon() {
  cartToggle.style.transform = 'scale(1.3)';
  setTimeout(() => { cartToggle.style.transform = ''; }, 250);
}

// ─── Add to cart buttons ───
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id, 10);
    addToCart(id);
    btn.textContent = 'Ajouté ✓';
    btn.style.background = '#c9a96e';
    btn.style.borderColor = '#c9a96e';
    btn.style.color = '#0a0a0a';
    setTimeout(() => {
      btn.textContent = 'Ajouter';
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 1600);
  });
});

// ─── Mobile menu ───
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

// Close menu on nav link click
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── Sticky header shadow ───
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ─── Scroll animations ───
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling cards
      const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
      let delay = 0;
      siblings.forEach((el, idx) => {
        if (el === entry.target) delay = idx * 80;
      });
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  scrollObserver.observe(el);
});

// ─── Smooth scroll ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── Newsletter ───
newsletterForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('emailInput');
  if (!input.value || !input.value.includes('@')) {
    input.style.borderColor = '#e55';
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
    return;
  }
  newsletterForm.querySelector('.newsletter__input-wrap').style.display = 'none';
  newsletterSuccess.classList.add('show');
});

// ─── Init ───
renderCart();
