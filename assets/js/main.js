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

/* ─── Team Carousel (infinite loop) ─────────────────────── */
(function () {
  const carousel  = document.getElementById('teamCarousel');
  if (!carousel) return;

  const wrapper   = carousel.querySelector('.team-carousel__track-wrapper');
  const track     = carousel.querySelector('.team-carousel__track');
  const prevBtn   = carousel.querySelector('.team-carousel__btn--prev');
  const nextBtn   = carousel.querySelector('.team-carousel__btn--next');
  const dotsWrap  = carousel.querySelector('.team-carousel__dots');
  const GAP       = 28; // deve coincidir com gap: 28px do CSS

  let current     = 0;  // índice real (0 … total-1)
  let visCount    = 0;
  let isAnimating = false;

  const getVisible = () =>
    window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;

  const getRealCards = () =>
    Array.from(track.querySelectorAll('.team-card:not(.team-card--clone)'));

  const getCardW = () =>
    (wrapper.offsetWidth - GAP * (visCount - 1)) / visCount;

  const getStep = () => getCardW() + GAP;

  /* ── Constrói clones e define largura dos cards ── */
  function buildTrack () {
    track.querySelectorAll('.team-card--clone').forEach(c => c.remove());
    visCount = getVisible();
    const real  = getRealCards();
    const total = real.length;
    const cw    = getCardW();

    real.forEach(c => { c.style.flex = `0 0 ${cw}px`; c.style.width = `${cw}px`; });

    // Clonar últimos `visCount` antes do primeiro real
    for (let i = total - visCount; i < total; i++) {
      const cl = real[i].cloneNode(true);
      cl.classList.add('team-card--clone');
      cl.style.flex = `0 0 ${cw}px`;
      cl.style.width = `${cw}px`;
      track.insertBefore(cl, track.firstChild);
    }
    // Clonar primeiros `visCount` após o último real
    for (let i = 0; i < visCount; i++) {
      const cl = real[i].cloneNode(true);
      cl.classList.add('team-card--clone');
      cl.style.flex = `0 0 ${cw}px`;
      cl.style.width = `${cw}px`;
      track.appendChild(cl);
    }

    setPos(false);
  }

  /* ── Posiciona o track sem/com animação ── */
  function setPos (animate) {
    track.style.transition = animate
      ? 'transform .45s cubic-bezier(.22,.61,.36,1)'
      : 'none';
    track.style.transform = `translateX(-${(visCount + current) * getStep()}px)`;
  }

  /* ── Navegação ── */
  function next () {
    if (isAnimating) return;
    isAnimating = true;
    current++;
    setPos(true);
  }

  function prev () {
    if (isAnimating) return;
    isAnimating = true;
    current--;
    setPos(true);
  }

  function goTo (idx) {
    current = idx;
    setPos(true);
    isAnimating = false;
    updateDots();
  }

  /* ── Ao terminar transição: checar se chegou em clone e resetar ── */
  track.addEventListener('transitionend', () => {
    const total = getRealCards().length;
    if (current >= total)      { current = 0;         setPos(false); }
    else if (current < 0)     { current = total - 1;  setPos(false); }
    isAnimating = false;
    updateDots();
  });

  /* ── Dots ── */
  function buildDots () {
    dotsWrap.innerHTML = '';
    getRealCards().forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'team-carousel__dot';
      btn.setAttribute('aria-label', `Membro ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    });
    updateDots();
  }

  function updateDots () {
    const total = getRealCards().length;
    const norm  = ((current % total) + total) % total;
    dotsWrap.querySelectorAll('.team-carousel__dot').forEach((d, i) =>
      d.classList.toggle('team-carousel__dot--active', i === norm));
  }

  /* ── Auto-play ── */
  let timer = setInterval(next, 4500);
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => { timer = setInterval(next, 4500); });

  /* ── Setas ── */
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* ── Touch / swipe ── */
  let tx0 = 0;
  track.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const d = tx0 - e.changedTouches[0].clientX;
    if (Math.abs(d) > 48) d > 0 ? next() : prev();
  }, { passive: true });

  /* ── Resize ── */
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { buildTrack(); buildDots(); }, 200);
  });

  /* ── Init ── */
  buildDots();
  buildTrack();
})();

/* ─── Depoimentos Carousel (infinite loop) ──────────────── */
(function () {
  const carousel  = document.getElementById('depoCarousel');
  if (!carousel) return;

  const wrapper   = carousel.querySelector('.depo-carousel__track-wrapper');
  const track     = carousel.querySelector('.depo-carousel__track');
  const prevBtn   = carousel.querySelector('.depo-carousel__btn--prev');
  const nextBtn   = carousel.querySelector('.depo-carousel__btn--next');
  const dotsWrap  = carousel.querySelector('.depo-carousel__dots');
  const GAP       = 28;

  let current     = 0;
  let visCount    = 0;
  let isAnimating = false;

  const getVisible = () =>
    window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;

  const getRealCards = () =>
    Array.from(track.querySelectorAll('.depo-card:not(.depo-card--clone)'));

  const getCardW = () =>
    (wrapper.offsetWidth - GAP * (visCount - 1)) / visCount;

  const getStep = () => getCardW() + GAP;

  function buildTrack () {
    track.querySelectorAll('.depo-card--clone').forEach(c => c.remove());
    visCount = getVisible();
    const real  = getRealCards();
    const total = real.length;
    const cw    = getCardW();

    real.forEach(c => { c.style.flex = `0 0 ${cw}px`; c.style.width = `${cw}px`; });

    for (let i = total - visCount; i < total; i++) {
      const cl = real[i].cloneNode(true);
      cl.classList.add('depo-card--clone');
      cl.style.flex = `0 0 ${cw}px`;
      cl.style.width = `${cw}px`;
      track.insertBefore(cl, track.firstChild);
    }
    for (let i = 0; i < visCount; i++) {
      const cl = real[i].cloneNode(true);
      cl.classList.add('depo-card--clone');
      cl.style.flex = `0 0 ${cw}px`;
      cl.style.width = `${cw}px`;
      track.appendChild(cl);
    }

    setPos(false);
  }

  function setPos (animate) {
    track.style.transition = animate
      ? 'transform .45s cubic-bezier(.22,.61,.36,1)'
      : 'none';
    track.style.transform = `translateX(-${(visCount + current) * getStep()}px)`;
  }

  function next () {
    if (isAnimating) return;
    isAnimating = true;
    current++;
    setPos(true);
  }

  function prev () {
    if (isAnimating) return;
    isAnimating = true;
    current--;
    setPos(true);
  }

  function goTo (idx) {
    current = idx;
    setPos(true);
    isAnimating = false;
    updateDots();
  }

  track.addEventListener('transitionend', () => {
    const total = getRealCards().length;
    if (current >= total)      { current = 0;         setPos(false); }
    else if (current < 0)      { current = total - 1; setPos(false); }
    isAnimating = false;
    updateDots();
  });

  function buildDots () {
    dotsWrap.innerHTML = '';
    getRealCards().forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'depo-carousel__dot';
      btn.setAttribute('aria-label', `Depoimento ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    });
    updateDots();
  }

  function updateDots () {
    const total = getRealCards().length;
    const norm  = ((current % total) + total) % total;
    dotsWrap.querySelectorAll('.depo-carousel__dot').forEach((d, i) =>
      d.classList.toggle('depo-carousel__dot--active', i === norm));
  }

  let timer = setInterval(next, 5000);
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => { timer = setInterval(next, 5000); });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  let tx0 = 0;
  track.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const d = tx0 - e.changedTouches[0].clientX;
    if (Math.abs(d) > 48) d > 0 ? next() : prev();
  }, { passive: true });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { buildTrack(); buildDots(); }, 200);
  });

  buildDots();
  buildTrack();
})();

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
