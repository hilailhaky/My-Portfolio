/*
  UX6 Background Controller
  - animated gradient mesh (floating blobs)
  - soft neon ambient lighting
  - parallax depth following cursor
  - optimized with RAF + prefers-reduced-motion
*/
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const root = document.documentElement;
  const bg = document.querySelector('.bg-ux');
  const img = document.getElementById('bgUxImg');

  if (!bg || !img) return;

  // Main background image (use the same one as existing site)
  const mainBg = (getComputedStyle(root).getPropertyValue('--main-bg') || "").trim();
  if (mainBg) {
    img.style.backgroundImage = mainBg;
  }

  let raf = 0;
  let tx = 0;
  let ty = 0;
  let sx = 0;
  let sy = 0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function onMove(e) {
    if (prefersReduced) return;
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const nx = (e.clientX / w) * 2 - 1; // -1..1
    const ny = (e.clientY / h) * 2 - 1;
    tx = clamp(nx, -1, 1);
    ty = clamp(ny, -1, 1);
    schedule();
  }

  function onScroll() {
    if (prefersReduced) return;
    const y = window.scrollY || 0;
    const max = Math.max(1, (document.body.scrollHeight - window.innerHeight));
    const p = clamp(y / max, 0, 1);
    sx = p;
    sy = 1 - p;
    schedule();
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(render);
  }

  function render() {
    raf = 0;
    if (prefersReduced) return;

    // cursor parallax depth
    const dx = tx * 18;
    const dy = ty * 14;

    // background translation (single canvas feeling)
    bg.style.setProperty('--ux-dx', `${dx}px`);
    bg.style.setProperty('--ux-dy', `${dy}px`);

    // subtle ambient shift with scroll
    bg.style.setProperty('--ux-sx', String(sx));
    bg.style.setProperty('--ux-sy', String(sy));
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal micro polish
  const revealEls = document.querySelectorAll('[data-reveal], .reveal');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach((el) => io.observe(el));
})();

