/* ══════════════════════════════════════════════════════════ */
/*  main.js — Hangar LP                                      */
/* ══════════════════════════════════════════════════════════ */

/* ─── Navbar scroll ──────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── Scroll reveal ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ─── Counter animation ──────────────────────────────────── */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEl = entry.target.querySelector('.numero-item__num');
      const text = numEl.textContent.replace(/\D/g, '');
      const target = parseInt(text);
      const hasPlus = numEl.querySelector('.numero-item__plus');
      const hasPercent = numEl.textContent.includes('%');

      const prefix = hasPlus ? '<span class="numero-item__plus">+</span>' : '';
      const suffix = hasPercent ? '<span style="font-size:30px">%</span>' : '';

      let count = 0;
      const interval = setInterval(() => {
        count += Math.ceil(target / 80);
        if (count >= target) {
          count = target;
          clearInterval(interval);
        }
        numEl.innerHTML = prefix + count + suffix;
      }, 20);

      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.numero-item').forEach(el => counterObserver.observe(el));

/* ─── Hamburger menu ─────────────────────────────────────── */
const hamburger = document.getElementById('navHamburger');
const navbarEl  = document.getElementById('navbar');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = navbarEl.classList.toggle('navbar--open');
    document.body.classList.toggle('nav-open', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  // Fechar ao clicar em link do menu
  document.querySelectorAll('.navbar__nav a').forEach(link => {
    link.addEventListener('click', () => {
      navbarEl.classList.remove('navbar--open');
      document.body.classList.remove('nav-open');
      hamburger.setAttribute('aria-label', 'Abrir menu');
    });
  });

  // Fechar ao clicar no overlay (body::after)
  document.addEventListener('click', (e) => {
    if (
      navbarEl.classList.contains('navbar--open') &&
      !navbarEl.contains(e.target)
    ) {
      navbarEl.classList.remove('navbar--open');
      document.body.classList.remove('nav-open');
      hamburger.setAttribute('aria-label', 'Abrir menu');
    }
  });
}

/* ─── Scroll suave para âncoras da navbar ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
