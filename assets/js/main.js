(function () {
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-navigation');
  const navLinks = document.querySelectorAll('.nav-link');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      nav.setAttribute('aria-expanded', String(!expanded));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      navLinks.forEach((n) => n.classList.remove('active'));
      this.classList.add('active');

      if (window.innerWidth <= 720 && navToggle && nav) {
        navToggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const filterButtons = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('.product-card');

  filterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const filter = this.dataset.filter;

      filterButtons.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      cards.forEach((card) => {
        const type = card.dataset.type;
        const show = filter === 'all' || type === filter;
        card.classList.toggle('hidden', !show);
      });
    });
  });
})();
