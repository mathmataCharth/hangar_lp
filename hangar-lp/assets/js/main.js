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
    // Clonar primeiros `visCount*2` após o último real (buffer para snap seamless)
    for (let i = 0; i < visCount * 2; i++) {
      const cl = real[i % total].cloneNode(true);
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

  /* ── Ao terminar transição: snap seamless ao "espelho" no array real ── */
  track.addEventListener('transitionend', () => {
    const total = getRealCards().length;
    if (current >= total)      { current = current - total; setPos(false); }
    else if (current < 0)      { current = current + total; setPos(false); }
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

  /* ── Swipe (Pointer Events — iOS, Android, desktop) ── */
  let pId = null, sx = 0, sy = 0;
  wrapper.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (pId !== null) return;
    pId = e.pointerId;
    sx = e.clientX; sy = e.clientY;
    try { wrapper.setPointerCapture(pId); } catch(_) {}
    clearInterval(timer);
  });
  wrapper.addEventListener('pointerup', e => {
    if (e.pointerId !== pId) return;
    pId = null;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    timer = setInterval(next, 4500);
  });
  wrapper.addEventListener('pointercancel', e => {
    if (e.pointerId !== pId) return;
    pId = null;
    timer = setInterval(next, 4500);
  });

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
  const GAP       = 24;

  let current     = 0;
  let visCount    = 0;
  let isAnimating = false;

  // Desktop: 2 cards visíveis | tablet/mobile: 1
  const getVisible = () => window.innerWidth > 1024 ? 2 : 1;

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
    for (let i = 0; i < visCount * 2; i++) {
      const cl = real[i % total].cloneNode(true);
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
    if (current >= total)      { current = current - total; setPos(false); }
    else if (current < 0)      { current = current + total; setPos(false); }
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

  /* ── Swipe (Pointer Events) ── */
  let pId = null, sx = 0, sy = 0;
  wrapper.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (pId !== null) return;
    pId = e.pointerId;
    sx = e.clientX; sy = e.clientY;
    try { wrapper.setPointerCapture(pId); } catch(_) {}
    clearInterval(timer);
  });
  wrapper.addEventListener('pointerup', e => {
    if (e.pointerId !== pId) return;
    pId = null;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    timer = setInterval(next, 5000);
  });
  wrapper.addEventListener('pointercancel', e => {
    if (e.pointerId !== pId) return;
    pId = null;
    timer = setInterval(next, 5000);
  });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { buildTrack(); buildDots(); }, 200);
  });

  buildDots();
  buildTrack();
})();

/* ─── Logos Carousel (infinite, 6 visíveis) ─────────────── */
(function () {
  const carousel  = document.getElementById('logosCarousel');
  if (!carousel) return;

  const wrapper   = carousel.querySelector('.logos-carousel__track-wrapper');
  const track     = carousel.querySelector('.logos-carousel__track');
  const prevBtn   = carousel.querySelector('.logos-carousel__btn--prev');
  const nextBtn   = carousel.querySelector('.logos-carousel__btn--next');
  const dotsWrap  = document.getElementById('logosDots');
  const GAP       = 32;
  const INTERVAL  = 2400;

  let current     = 0;
  let visCount    = 0;
  let isAnimating = false;

  const getVisible = () =>
    window.innerWidth <= 640 ? 2 : window.innerWidth <= 1024 ? 4 : 6;

  const getRealCards = () =>
    Array.from(track.querySelectorAll('.logos-carousel__item:not(.logos-carousel__item--clone)'));

  const getCardW = () =>
    (wrapper.offsetWidth - GAP * (visCount - 1)) / visCount;

  const getStep = () => getCardW() + GAP;

  function buildTrack () {
    track.querySelectorAll('.logos-carousel__item--clone').forEach(c => c.remove());
    visCount = getVisible();
    const real  = getRealCards();
    const total = real.length;
    const cw    = getCardW();

    real.forEach(c => { c.style.flex = `0 0 ${cw}px`; c.style.width = `${cw}px`; });

    for (let i = total - visCount; i < total; i++) {
      const cl = real[i].cloneNode(true);
      cl.classList.add('logos-carousel__item--clone');
      cl.style.flex = `0 0 ${cw}px`; cl.style.width = `${cw}px`;
      track.insertBefore(cl, track.firstChild);
    }
    for (let i = 0; i < visCount * 2; i++) {
      const cl = real[i % total].cloneNode(true);
      cl.classList.add('logos-carousel__item--clone');
      cl.style.flex = `0 0 ${cw}px`; cl.style.width = `${cw}px`;
      track.appendChild(cl);
    }
    setPos(false);
    buildDots();
  }

  function setPos (animate) {
    track.style.transition = animate
      ? 'transform .45s cubic-bezier(.22,.61,.36,1)'
      : 'none';
    track.style.transform = `translateX(-${(visCount + current) * getStep()}px)`;
  }

  function next () { if (isAnimating) return; isAnimating = true; current += visCount; setPos(true); }
  function prev () { if (isAnimating) return; isAnimating = true; current -= visCount; setPos(true); }

  /* ── Dots ── */
  function buildDots () {
    if (!dotsWrap) return;
    const total = getRealCards().length;
    const pages = Math.ceil(total / visCount);
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const btn = document.createElement('button');
      btn.className = 'logos-carousel__dot';
      btn.setAttribute('aria-label', `Página ${i + 1}`);
      btn.addEventListener('click', () => { current = i * visCount; setPos(true); isAnimating = false; updateDots(); });
      dotsWrap.appendChild(btn);
    }
    updateDots();
  }

  function updateDots () {
    if (!dotsWrap) return;
    const total = getRealCards().length;
    const pages = Math.ceil(total / visCount);
    const norm  = ((current % total) + total) % total;
    const page  = Math.floor(norm / visCount);
    dotsWrap.querySelectorAll('.logos-carousel__dot').forEach((d, i) =>
      d.classList.toggle('logos-carousel__dot--active', i === page));
  }

  track.addEventListener('transitionend', () => {
    const total = getRealCards().length;
    if (current >= total)      { current = current - total; setPos(false); }
    else if (current < 0)      { current = current + total; setPos(false); }
    isAnimating = false;
    updateDots();
  });

  let timer = setInterval(next, INTERVAL);
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => { timer = setInterval(next, INTERVAL); });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* ── Swipe (Pointer Events) ── */
  let pId = null, sx = 0, sy = 0;
  wrapper.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (pId !== null) return;
    pId = e.pointerId;
    sx = e.clientX; sy = e.clientY;
    try { wrapper.setPointerCapture(pId); } catch(_) {}
    clearInterval(timer);
  });
  wrapper.addEventListener('pointerup', e => {
    if (e.pointerId !== pId) return;
    pId = null;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    timer = setInterval(next, INTERVAL);
  });
  wrapper.addEventListener('pointercancel', e => {
    if (e.pointerId !== pId) return;
    pId = null;
    timer = setInterval(next, INTERVAL);
  });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(buildTrack, 200);
  });

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
