(function(){
  // Small navigation toggle and active-link highlighting
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-navigation');
  const navLinks = document.querySelectorAll('.nav-link');
  const yearEl = document.getElementById('year');

  if(yearEl) yearEl.textContent = new Date().getFullYear();

  navToggle && navToggle.addEventListener('click', function(){
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-expanded', String(!expanded));
  });

  // Smooth scroll and active state
  navLinks.forEach(link => {
    link.addEventListener('click', function(e){
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if(target){
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
      // close mobile menu
      if(window.innerWidth <= 720 && navToggle){
        navToggle.setAttribute('aria-expanded','false');
        nav.setAttribute('aria-expanded','false');
      }
      // update active
      navLinks.forEach(n=>n.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Basic form validation & simulated submit
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if(!name || !email || !message){
        status.textContent = 'Please complete all fields.';
        status.style.color = '#ffb86b';
        return;
      }
      // simple email pattern
      if(!/^\S+@\S+\.\S+$/.test(email)){
        status.textContent = 'Please enter a valid email address.';
        status.style.color = '#ffb86b';
        return;
      }
      status.textContent = 'Sending...';
      setTimeout(()=>{
        status.textContent = 'Message sent — we will contact you soon!';
        status.style.color = 'var(--accent)';
        form.reset();
      }, 900);
    });
  }

})();