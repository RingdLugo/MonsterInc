/* ============================================================
   MONSTERS INC — Tienda Online · script.js completo y funcional
   ============================================================ */

/* ── Estado global ── */
let PRODUCTS = [];

async function loadProductsFromDB() {
  try {
    const response = await fetch('api.php?action=get_products');
    const data = await response.json();
    if (data.error) {
      console.error('Error de la API de productos:', data.error);
      return;
    }
    PRODUCTS = data;
    initWishlistButtons();
  } catch (err) {
    console.error('Error al cargar productos de la base de datos:', err);
  }
}

let cart     = [];
let wishlist = new Set();

/* ── Helpers ── */
const fmt = n => '$' + n.toLocaleString('es-MX');
const $   = id => document.getElementById(id);
const qs  = s  => document.querySelector(s);
const qsa = s  => [...document.querySelectorAll(s)];

/* ══════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════ */
function showToast(msg) {
  const t = $('toast');
  $('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════════════════
   CARRITO
══════════════════════════════════════════════════ */
function openCart() {
  $('cartOverlay').classList.add('open');
  $('cartPanel').classList.add('open');
  renderCart();
}
function closeCart() {
  $('cartOverlay').classList.remove('open');
  $('cartPanel').classList.remove('open');
}

function addToCart(nameOrId) {
  let product = typeof nameOrId === 'number'
    ? PRODUCTS.find(p => p.id === nameOrId)
    : PRODUCTS.find(p => p.name.includes(nameOrId) || nameOrId.includes(p.brand));
  if (!product) product = { id: 99 + Math.random(), name: nameOrId, price: 0, icon: '🛒', brand: '', cat: '' };
  const existing = cart.find(i => i.product.id === product.id);
  if (existing) { existing.qty++; } else { cart.push({ product, qty: 1 }); }
  updateCartBadge();
  renderCart();
  showToast('✓ ' + (product.name || nameOrId).split(' ').slice(0,3).join(' ') + ' agregado');
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.product.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.product.id !== productId);
  updateCartBadge();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.product.id !== productId);
  updateCartBadge();
  renderCart();
  showToast('Producto eliminado del carrito');
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  $('cart-count').textContent = total;
}

function renderCart() {
  const container = $('cart-items');
  const footerEl  = $('cart-footer');
  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--muted)">
        <div style="font-size:64px;margin-bottom:16px">🛒</div>
        <div style="font-size:15px;font-weight:600;margin-bottom:6px">Tu carrito está vacío</div>
        <div style="font-size:13px">¡Agrega productos y empieza a ahorrar!</div>
        <button class="btn btn-primary" style="margin-top:20px" onclick="closeCart()">Explorar productos</button>
      </div>`;
    footerEl.style.display = 'none';
    return;
  }
  footerEl.style.display = '';
  let subtotal = 0;
  container.innerHTML = cart.map(({ product, qty }) => {
    const line = product.price * qty;
    subtotal += line;
    const shortName = product.name.length > 38 ? product.name.slice(0,38)+'…' : product.name;
    return `
      <div class="cart-item">
        <div class="cart-item-img">${product.icon || '📦'}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${product.brand ? product.brand+' · ' : ''}${shortName}</div>
          <div class="cart-item-price">${product.price ? fmt(product.price) : '—'}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${JSON.stringify(product.id)}, -1)">−</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" onclick="changeQty(${JSON.stringify(product.id)}, 1)">+</button>
            <button onclick="removeFromCart(${JSON.stringify(product.id)})" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--muted);font-size:18px" title="Eliminar">🗑</button>
          </div>
          ${qty > 1 && product.price ? `<div style="font-size:11px;color:var(--accent);font-weight:600;margin-top:4px">Total línea: ${fmt(line)}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  const free = subtotal >= 599;
  $('cart-subtotal').textContent       = fmt(subtotal);
  $('cart-shipping-label').textContent = free ? '🚚 Envío gratis' : '📦 Envío';
  $('cart-shipping-msg').textContent   = free ? '¡Lo tienes!' : `Faltan ${fmt(599 - subtotal)}`;
  $('cart-total-amount').textContent   = fmt(subtotal);
}

async function checkout() {
  if (cart.length === 0) { showToast('Tu carrito está vacío'); return; }
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  showToast('⏳ Registrando compra en base de datos...');

  // Nombres aleatorios de Monsters Inc para simular la compra en el sistema interno
  const names = ['Sulley Sullivan', 'Mike Wazowski', 'Boo', 'Randall Boggs', 'Celia Mae', 'Roz', 'Henry Waternoose'];
  const emails = ['sulley@monsters.com', 'wazowski@monsters.com', 'boo@humanworld.com', 'randall@monsters.com', 'celia@monsters.com', 'roz@cda.com', 'waternoose@monsters.com'];
  const idx = Math.floor(Math.random() * names.length);
  
  const paymentMethods = ['Tarjeta de Crédito', 'PayPal', 'SPEI', 'OXXO Pay'];
  const randomPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  const saleData = {
    cliente_nombre: names[idx],
    cliente_email: emails[idx],
    metodo_pago: randomPayment,
    notas: 'Compra automática simulada desde el carrito online.',
    items: cart.map(i => ({
      id: i.product.id,
      qty: i.qty
    }))
  };

  try {
    const res = await fetch('api.php?action=create_sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });
    const data = await res.json();
    
    if (data.success) {
      cart = [];
      updateCartBadge();
      renderCart();
      closeCart();
      showToast(`✓ ¡Compra #${data.venta_id} guardada en BD!`);
      alert(`🎉 ¡Compra exitosa!\n\nSe ha registrado la Venta #${data.venta_id} en la base de datos a nombre de ${saleData.cliente_nombre}.\nTotal: ${fmt(data.total)}\n\nVe a la pestaña de "Admin" en el menú superior para verla reflejada en el sistema interno.`);
    } else {
      showToast('⚠️ Error: ' + data.error);
      alert('Error de inventario: ' + data.error);
    }
  } catch (err) {
    showToast('⚠️ Error de conexión con la base de datos');
    console.error(err);
  }
}

function clearCart() {
  cart = [];
  updateCartBadge();
  renderCart();
  showToast('Carrito vaciado');
}

/* ══════════════════════════════════════════════════
   WISHLIST
══════════════════════════════════════════════════ */
function toggleWishlist(productId, btn) {
  const svg = btn.querySelector('svg');
  if (wishlist.has(productId)) {
    wishlist.delete(productId);
    svg.style.fill = 'none';
    svg.style.stroke = 'var(--muted)';
    showToast('Eliminado de favoritos');
  } else {
    wishlist.add(productId);
    svg.style.fill = 'var(--accent)';
    svg.style.stroke = 'var(--accent)';
    showToast('❤️ Agregado a favoritos');
  }
}

function initWishlistButtons() {
  qsa('.product-wishlist').forEach((btn, i) => {
    const product = PRODUCTS[i];
    if (!product) return;
    btn.onclick = e => { e.stopPropagation(); toggleWishlist(product.id, btn); };
    btn.title = 'Agregar a favoritos';
  });
}

function openWishlist() {
  if (wishlist.size === 0) { showToast('Tu lista de favoritos está vacía ♡'); return; }
  showToast('❤️ ' + wishlist.size + ' producto(s) en favoritos');
}

/* ══════════════════════════════════════════════════
   BÚSQUEDA
══════════════════════════════════════════════════ */
function initSearch() {
  const input  = qs('.search-bar input');
  const select = qs('.search-bar select');
  const btn    = qs('.search-bar button');
  function doSearch() {
    const query = input.value.trim().toLowerCase();
    const cat   = select.value;
    if (!query && cat === 'Todo') { showToast('Escribe algo para buscar'); return; }
    const results = PRODUCTS.filter(p => {
      const matchCat   = cat === 'Todo' || p.cat === cat;
      const matchQuery = !query || p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
    if (results.length === 0) {
      showToast('Sin resultados para "' + (query || cat) + '"');
    } else {
      showToast('🔍 ' + results.length + ' resultado(s) para "' + (query || cat) + '"');
      qs('.products-grid') && qs('.products-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => e.key === 'Enter' && doSearch());
}

/* ══════════════════════════════════════════════════
   NAV CATEGORÍAS
══════════════════════════════════════════════════ */
function initNavCats() {
  qsa('.nav-cat').forEach(cat => {
    cat.addEventListener('click', function(e) {
      e.preventDefault();
      qsa('.nav-cat').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      showToast('📂 ' + this.textContent.trim().replace('☰ ',''));
    });
  });
}

function initProductFilters() {
  const btns = qsa('.section-header .btn');
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      btns.forEach(b => { b.className = b.className.replace('btn-dark','btn-outline'); });
      this.className = this.className.replace('btn-outline','btn-dark');
      showToast('Ordenando: ' + this.textContent.trim());
    });
  });
}

function initCatCards() {
  qsa('.cat-card').forEach(card => {
    card.addEventListener('click', function() {
      const name = this.querySelector('.cat-name').textContent;
      showToast('📂 Filtrando: ' + name);
      qs('.products-grid') && qs('.products-grid').scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
}

/* ══════════════════════════════════════════════════
   TIMER
══════════════════════════════════════════════════ */
function initTimer() {
  let h = 8, m = 47, s = 33;
  function tick() {
    s--;
    if (s < 0) { s = 59; m--; if (m < 0) { m = 59; h--; if (h < 0) { h = 0; m = 0; s = 0; } } }
    if ($('t-h')) $('t-h').textContent = String(h).padStart(2,'0');
    if ($('t-m')) $('t-m').textContent = String(m).padStart(2,'0');
    if ($('t-s')) $('t-s').textContent = String(s).padStart(2,'0');
  }
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════════════ */
function initNewsletter() {
  const btn   = qs('.newsletter-btn');
  const input = qs('.newsletter-input');
  if (!btn || !input) return;
  const submit = () => {
    const email = input.value.trim();
    if (!email || !email.includes('@')) { showToast('⚠️ Ingresa un correo válido'); return; }
    showToast('🎉 ¡Suscrito! Ofertas para: ' + email);
    input.value = '';
  };
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', e => e.key === 'Enter' && submit());
}

/* ══════════════════════════════════════════════════
   MISCELÁNEOS
══════════════════════════════════════════════════ */
function initBrands() {
  qsa('.brand-item').forEach(b => b.addEventListener('click', () => showToast('🏷️ ' + b.textContent.trim())));
}

function initSocial() {
  const labels = ['Facebook','Instagram','YouTube','TikTok'];
  qsa('.social-btn').forEach((btn,i) => btn.addEventListener('click', () => showToast('Ir a ' + (labels[i]||'redes sociales'))));
}

function initPaymentIcons() {
  qsa('.payment-icon').forEach(icon => {
    icon.style.cursor = 'pointer';
    icon.addEventListener('click', () => showToast('💳 ' + icon.textContent.trim() + ' disponible'));
  });
}

function initReviews() {
  qsa('.review-card').forEach(card => {
    const btn = document.createElement('button');
    btn.innerHTML = '👍 Útil';
    btn.style.cssText = 'margin-top:12px;background:none;border:1px solid var(--border);border-radius:20px;padding:4px 14px;font-size:12px;cursor:pointer;color:var(--muted);font-family:var(--font-body)';
    btn.addEventListener('click', function() {
      if (this.dataset.liked) return;
      this.dataset.liked = '1';
      this.innerHTML = '👍 ¡Gracias!';
      this.style.color = 'var(--accent)';
      this.style.borderColor = 'var(--accent)';
    });
    card.appendChild(btn);
  });
}

function initStickyHeader() {
  const header = qs('header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,.12)' : 'none';
  }, { passive: true });
}

function initAnnouncementBar() {
  const bar = qs('.announcement-bar');
  if (!bar) return;
  const msgs = [
    '🚚 Envío GRATIS en compras mayores a $599',
    '💳 3, 6 y 12 meses sin intereses',
    '🔥 ¡Descuentos hasta 60% OFF en electrónica!',
    '🎁 Regístrate y obtén $200 de bienvenida',
    '⭐ Club Monsters: precios exclusivos todo el año',
  ];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % msgs.length;
    bar.style.opacity = '0';
    bar.style.transition = 'opacity .3s';
    setTimeout(() => {
      const span = bar.querySelector('span');
      if (span) span.textContent = msgs[idx];
      bar.style.opacity = '1';
    }, 300);
  }, 4000);
}

function initBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '↑';
  btn.title = 'Volver arriba';
  btn.style.cssText = 'position:fixed;bottom:80px;right:24px;width:44px;height:44px;background:var(--primary);color:#fff;border:none;border-radius:50%;font-size:18px;font-weight:700;cursor:pointer;z-index:999;opacity:0;pointer-events:none;transition:opacity .3s;box-shadow:0 4px 16px rgba(0,0,0,.25)';
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.style.opacity = show ? '1' : '0';
    btn.style.pointerEvents = show ? 'all' : 'none';
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initProgressBar() {
  const fill = qs('.progress-fill');
  if (!fill) return;
  fill.style.width = '0%';
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      fill.style.transition = 'width 1.5s ease';
      fill.style.width = '67%';
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(fill);
}

function initProductAnimations() {
  const cards = qsa('.product-card, .cat-card, .review-card, .hero-card, .promo-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = e.target.style.transform.replace(' translateY(24px)','');
        }, i * 70);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = (card.style.transform || '') + ' translateY(24px)';
    card.style.transition = 'opacity .45s ease, transform .45s ease, box-shadow .2s';
    obs.observe(card);
  });
}

/* ══════════════════════════════════════════════════
   FOOTER CARRITO — reescribir para tener IDs
══════════════════════════════════════════════════ */
function ensureCartFooterIds() {
  const footer = $('cart-footer');
  if (!footer) return;
  footer.innerHTML = `
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:8px">
      <span>Subtotal</span><span id="cart-subtotal">$0</span>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#16a34a;margin-bottom:12px">
      <span id="cart-shipping-label">📦 Envío</span>
      <span id="cart-shipping-msg">Gratis desde $599</span>
    </div>
    <div class="cart-total">
      <span>Total</span>
      <strong id="cart-total-amount">$0</strong>
    </div>
    <button class="btn btn-primary" style="width:100%;justify-content:center;font-size:15px;padding:16px;margin-bottom:8px" onclick="checkout()">Proceder al pago →</button>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline" style="flex:1;justify-content:center;font-size:13px" onclick="closeCart()">Seguir comprando</button>
      <button class="btn btn-outline" style="padding:14px 16px;font-size:13px;color:var(--muted)" onclick="clearCart()" title="Vaciar carrito">🗑</button>
    </div>`;
  footer.style.display = 'none';
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  ensureCartFooterIds();
  await loadProductsFromDB();
  initTimer();
  initSearch();
  initNavCats();
  initProductFilters();
  initCatCards();
  initNewsletter();
  initBrands();
  initSocial();
  initPaymentIcons();
  initReviews();
  initStickyHeader();
  initAnnouncementBar();
  initBackToTop();
  initProgressBar();
  initProductAnimations();
  updateCartBadge();
});