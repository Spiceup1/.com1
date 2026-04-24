(function () {
  const products = [
    { id: 'P1', name: 'Premium Almonds', category: 'nuts', price: 12.5, desc: 'Crunchy California almonds, high in protein.', popular: 5 },
    { id: 'P2', name: 'Whole Cashews', category: 'nuts', price: 14.0, desc: 'Rich and buttery cashews for snacking.', popular: 4 },
    { id: 'P3', name: 'Walnut Halves', category: 'nuts', price: 13.75, desc: 'Omega-rich walnut halves for daily nutrition.', popular: 3 },
    { id: 'P4', name: 'Turmeric Powder', category: 'spices', price: 6.2, desc: 'Aromatic turmeric with vibrant natural color.', popular: 5 },
    { id: 'P5', name: 'Kashmiri Red Chili', category: 'spices', price: 7.1, desc: 'Adds rich red color and balanced heat.', popular: 4 },
    { id: 'P6', name: 'Whole Cumin Seeds', category: 'spices', price: 5.9, desc: 'Fragrant cumin seeds for tempering.', popular: 4 },
    { id: 'P7', name: 'Masala Peanuts', category: 'snacks', price: 4.3, desc: 'Spicy roasted peanuts, crowd favorite snack.', popular: 3 },
    { id: 'P8', name: 'Roasted Makhana', category: 'snacks', price: 5.4, desc: 'Lightly salted foxnuts, healthy and crunchy.', popular: 5 }
  ];

  const orderDB = {
    'NSM-1001': 'Packed and ready for dispatch.',
    'NSM-1002': 'In transit. Expected delivery in 2 days.',
    'NSM-1003': 'Inquiry received. Sales team will call shortly.'
  };

  const state = {
    cart: JSON.parse(localStorage.getItem('nsm_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('nsm_wishlist') || '[]'),
    user: JSON.parse(localStorage.getItem('nsm_user') || 'null'),
    search: '',
    category: 'all',
    sort: 'popular'
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setupNav();
  setupAuth();
  setupCatalogControls();
  setupCartPanel();
  setupTracking();
  setupNewsletter();
  updateUserGreeting();
  renderProducts();
  refreshCounts();

  function setupNav() {
    const navToggle = $('#nav-toggle');
    const nav = $('#primary-navigation');
    const navLinks = $$('.nav-link');

    if (navToggle && nav) {
      navToggle.addEventListener('click', function () {
        const expanded = nav.getAttribute('aria-expanded') === 'true';
        nav.setAttribute('aria-expanded', String(!expanded));
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(this.getAttribute('href').slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navLinks.forEach((n) => n.classList.remove('active'));
        this.classList.add('active');
        if (nav) nav.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function setupAuth() {
    const modal = $('#auth-modal');
    $('#auth-btn')?.addEventListener('click', () => modal?.classList.remove('hidden'));
    $('#auth-close')?.addEventListener('click', () => modal?.classList.add('hidden'));

    $('#auth-form')?.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = $('#auth-name').value.trim();
      const email = $('#auth-email').value.trim();
      const status = $('#auth-status');
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
        status.textContent = 'Enter valid name and email.';
        return;
      }
      state.user = { name, email };
      localStorage.setItem('nsm_user', JSON.stringify(state.user));
      status.textContent = 'Account saved locally.';
      updateUserGreeting();
      setTimeout(() => modal.classList.add('hidden'), 500);
    });
  }

  function updateUserGreeting() {
    const greet = $('#user-greeting');
    if (!greet) return;
    greet.textContent = state.user
      ? `Welcome back, ${state.user.name}! Wishlist and cart are ready.`
      : 'Tip: Login/signup to personalize your wishlist and inquiry cart.';
  }

  function setupCatalogControls() {
    $('#search-input')?.addEventListener('input', (e) => {
      state.search = e.target.value.toLowerCase().trim();
      renderProducts();
    });
    $('#category-select')?.addEventListener('change', (e) => {
      state.category = e.target.value;
      renderProducts();
    });
    $('#sort-select')?.addEventListener('change', (e) => {
      state.sort = e.target.value;
      renderProducts();
    });

    $('#wishlist-btn')?.addEventListener('click', () => {
      const ids = state.wishlist;
      const names = products.filter((p) => ids.includes(p.id)).map((p) => p.name);
      alert(names.length ? `Wishlist:\n- ${names.join('\n- ')}` : 'Your wishlist is empty.');
    });
  }

  function renderProducts() {
    const grid = $('#products-grid');
    if (!grid) return;

    let list = products.filter((p) => {
      const catOk = state.category === 'all' || p.category === state.category;
      const searchOk = !state.search || `${p.name} ${p.desc}`.toLowerCase().includes(state.search);
      return catOk && searchOk;
    });

    list = sortProducts(list, state.sort);

    grid.innerHTML = list.map((p) => `
      <article class="product-card">
        <span class="badge">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="card-meta">
          <span class="price">$${p.price.toFixed(2)}</span>
          <span class="muted">⭐ ${p.popular}.0</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" data-add="${p.id}">Add to Cart</button>
          <button class="btn btn-ghost btn-sm" data-wish="${p.id}">${state.wishlist.includes(p.id) ? '♥ Saved' : '♡ Wishlist'}</button>
        </div>
      </article>
    `).join('');

    $('#empty-state').classList.toggle('hidden', list.length > 0);

    $$('[data-add]').forEach((btn) => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
    $$('[data-wish]').forEach((btn) => btn.addEventListener('click', () => toggleWishlist(btn.dataset.wish)));
  }

  function sortProducts(list, mode) {
    const arr = [...list];
    if (mode === 'price-asc') return arr.sort((a, b) => a.price - b.price);
    if (mode === 'price-desc') return arr.sort((a, b) => b.price - a.price);
    if (mode === 'name-asc') return arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr.sort((a, b) => b.popular - a.popular);
  }

  function addToCart(productId) {
    const found = state.cart.find((i) => i.id === productId);
    if (found) found.qty += 1;
    else state.cart.push({ id: productId, qty: 1 });
    persistCart();
    renderCart();
    openCart();
  }

  function toggleWishlist(productId) {
    const idx = state.wishlist.indexOf(productId);
    if (idx >= 0) state.wishlist.splice(idx, 1);
    else state.wishlist.push(productId);
    localStorage.setItem('nsm_wishlist', JSON.stringify(state.wishlist));
    refreshCounts();
    renderProducts();
  }

  function setupCartPanel() {
    $('#cart-btn')?.addEventListener('click', openCart);
    $('#cart-close')?.addEventListener('click', closeCart);
    $('#checkout-btn')?.addEventListener('click', submitInquiryOrder);
    renderCart();
  }

  function openCart() {
    const panel = $('#cart-panel');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    const panel = $('#cart-panel');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }

  function renderCart() {
    const wrap = $('#cart-items');
    if (!wrap) return;
    if (!state.cart.length) {
      wrap.innerHTML = '<p class="muted">Cart is empty. Add products from catalog.</p>';
      $('#cart-total').textContent = 'Total: $0.00';
      refreshCounts();
      return;
    }

    let total = 0;
    wrap.innerHTML = state.cart.map((line) => {
      const p = products.find((x) => x.id === line.id);
      if (!p) return '';
      const amount = p.price * line.qty;
      total += amount;
      return `
        <div class="cart-item">
          <strong>${p.name}</strong>
          <p class="muted">$${p.price.toFixed(2)} × ${line.qty} = $${amount.toFixed(2)}</p>
          <button class="btn btn-ghost btn-sm" data-remove="${p.id}">Remove</button>
        </div>
      `;
    }).join('');

    $('#cart-total').textContent = `Total: $${total.toFixed(2)}`;
    $$('[data-remove]').forEach((btn) => btn.addEventListener('click', () => removeFromCart(btn.dataset.remove)));
    refreshCounts();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter((i) => i.id !== productId);
    persistCart();
    renderCart();
  }

  function submitInquiryOrder() {
    if (!state.cart.length) {
      alert('Your cart is empty.');
      return;
    }
    const id = `NSM-${Math.floor(1000 + Math.random() * 9000)}`;
    const msg = state.user
      ? `Inquiry order ${id} submitted for ${state.user.name}.`
      : `Inquiry order ${id} submitted. (Login to save customer profile)`;
    alert(`${msg}\nNo payment taken online. Sales team will contact you.`);
    state.cart = [];
    persistCart();
    renderCart();
    closeCart();
  }

  function persistCart() {
    localStorage.setItem('nsm_cart', JSON.stringify(state.cart));
  }

  function refreshCounts() {
    $('#cart-count').textContent = state.cart.reduce((sum, i) => sum + i.qty, 0);
    $('#wishlist-count').textContent = state.wishlist.length;
  }

  function setupTracking() {
    $('#track-btn')?.addEventListener('click', () => {
      const id = $('#track-input').value.trim().toUpperCase();
      $('#track-result').textContent = orderDB[id] || 'Order ID not found. Please contact support.';
    });
  }

  function setupNewsletter() {
    $('#newsletter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#newsletter-email').value.trim();
      const status = $('#newsletter-status');
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        status.textContent = 'Please enter a valid email.';
        return;
      }
      status.textContent = 'Subscribed! You will receive offers and updates.';
      e.target.reset();
    });
  }
})();
