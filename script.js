/**
 * PORTFOLIO WEBSITE - JavaScript
 * ================================
 * Fitur: Navbar, Smooth Scroll, Figma Parallax Scene, Intersection Observer,
 *        Dark Mode, Hamburger Menu, Certificate Lightbox
 *
 * Parallax mengikuti pola Figma "Simple Parallax Animation":
 * - Multi-layer dengan kecepatan berbeda (parallax sandwich)
 * - Scroll parallax via transform (performant)
 * - Mouse parallax di desktop
 */

(function () {
  'use strict';

  /* ---------- DOM Elements ---------- */
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('navMenu');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelectorAll('.navbar__link');
  const themeToggle = document.getElementById('themeToggle');
  const hero = document.getElementById('hero');
  const parallaxScene = document.getElementById('parallaxScene');
  const heroContent = document.getElementById('heroContent');
  const heroImageRing = document.querySelector('.hero__image-ring');
  const parallaxLayers = document.querySelectorAll('[data-speed]');
  const revealElements = document.querySelectorAll('.reveal');
  const certCards = document.querySelectorAll('.cert-card');
  const certModal = document.getElementById('certModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const modalImage = document.getElementById('modalImage');
  const modalLink = document.getElementById('modalLink');
  const sections = document.querySelectorAll('section[id]');

  /* ---------- Constants ---------- */
  const MOBILE_BREAKPOINT = 768;
  let parallaxEnabled = window.matchMedia(
    '(min-width: 769px) and (prefers-reduced-motion: no-preference)'
  ).matches;
  let mouseParallaxEnabled = parallaxEnabled;

  /* Mouse position (normalized -1 to 1) */
  let mouseX = 0;
  let mouseY = 0;

  /* ============================================
     1. DARK MODE TOGGLE
     ============================================ */
  function initTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    updateThemeIcon();
  }

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const icon = themeToggle.querySelector('i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateThemeIcon();
  });

  initTheme();

  /* ============================================
     2. STICKY NAVBAR & ACTIVE LINK
     ============================================ */
  function handleNavbarScroll() {
    const scrollY = window.scrollY;
    const heroHeight = hero ? hero.offsetHeight : 0;

    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active nav link
    const scrollPos = scrollY + navbar.offsetHeight + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });

    if (heroContent) {
      heroContent.style.opacity = '1';
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ============================================
     Global seamless background parallax
     - Update CSS vars --bg-move-x / --bg-move-y
     - Subtle mouse + smooth scroll
     ============================================ */
  const bgSeamless = document.querySelector('.bg-seamless');
  let bgEnabled = !!bgSeamless && window.matchMedia('(min-width: 769px) and (prefers-reduced-motion: no-preference)').matches;
  let bgMouseX = 0;
  let bgMouseY = 0;
  let bgScrollY = 0;
  let bgTicking = false;

  function updateBg() {
    bgTicking = false;
    if (!bgEnabled || !bgSeamless) return;

    // normalize: -1..1 for mouse, 0..1-ish for scroll
    // dibuat lebih terasa & elegan (premium, tidak norak)
    const x = bgMouseX * 46; // pixels factor
    const y = (bgScrollY * 58) + bgMouseY * 28;


    document.documentElement.style.setProperty('--bg-move-x', String(x));
    document.documentElement.style.setProperty('--bg-move-y', String(y));

    // fallback direct transform if CSS vars not supported by theme tooling
    // lebih seamless & responsif (satu canvas background global)
    bgSeamless.style.transform = `translate3d(${x * -0.22}px, ${y * -0.22}px, 0) scale(1.12)`;

  }

  function requestBgUpdate() {
    if (bgTicking) return;
    bgTicking = true;
    requestAnimationFrame(updateBg);
  }

  function onBgMouseMove(e) {
    if (!bgEnabled) return;
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const nx = (e.clientX / w) * 2 - 1;
    const ny = (e.clientY / h) * 2 - 1;
    bgMouseX = Math.max(-1, Math.min(1, nx));
    bgMouseY = Math.max(-1, Math.min(1, ny));
    requestBgUpdate();
  }

  function onBgScroll() {
    if (!bgEnabled) return;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    bgScrollY = Math.min(1, Math.max(0, window.scrollY / max));
    requestBgUpdate();
  }

  if (bgEnabled) {
    window.addEventListener('mousemove', onBgMouseMove, { passive: true });
    window.addEventListener('scroll', onBgScroll, { passive: true });
    onBgScroll();
  }

  window.addEventListener('resize', () => {
    bgEnabled = !!bgSeamless && window.matchMedia('(min-width: 769px) and (prefers-reduced-motion: no-preference)').matches;
    if (!bgEnabled) {
      bgMouseX = 0;
      bgMouseY = 0;
      bgScrollY = 0;
      document.documentElement.style.setProperty('--bg-move-x', '0');
      document.documentElement.style.setProperty('--bg-move-y', '0');
      if (bgSeamless) bgSeamless.style.transform = '';
    } else {
      onBgScroll();
    }
    initParallax();
    handleNavbarScroll();
  });


  /* ============================================
     3. HAMBURGER MENU (Mobile)
     ============================================ */
  function toggleMenu() {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMenu);
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  /* ============================================
     4. SMOOTH SCROLL NAVIGATION
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================
     5. FIGMA PARALLAX SCENE
     Scroll: layer bergerak dengan kecepatan berbeda (data-speed)
     Mouse: layer dengan data-mouse mengikuti kursor (desktop)
     Semua via transform — tanpa layout shift
     ============================================ */
  let parallaxTicking = false;

  function applyParallaxTransform(el, scrollY, speed, mouseFactor) {
    const yScroll = scrollY * speed;
    const xMouse = mouseX * mouseFactor * 100;
    const yMouse = mouseY * mouseFactor * 100;

    el.style.transform = `translate3d(${xMouse}px, ${yScroll + yMouse}px, 0)`;
  }

  function updateParallax() {
    if (!parallaxEnabled || !hero) {
      parallaxTicking = false;
      return;
    }

    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollY > heroHeight * 1.2) {
      parallaxTicking = false;
      return;
    }

    parallaxLayers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed) || 0.3;
      const mouseFactor = mouseParallaxEnabled
        ? parseFloat(layer.dataset.mouse) || 0
        : 0;

      applyParallaxTransform(layer, scrollY, speed, mouseFactor);
    });

    parallaxTicking = false;
  }

  function onParallaxScroll() {
    if (!parallaxTicking && parallaxEnabled) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }

  function onMouseMove(e) {
    if (!mouseParallaxEnabled || !hero) return;

    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX = (e.clientX - centerX) / (rect.width / 2);
    mouseY = (e.clientY - centerY) / (rect.height / 2);

    mouseX = Math.max(-1, Math.min(1, mouseX));
    mouseY = Math.max(-1, Math.min(1, mouseY));

    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }

  function initParallax() {
    parallaxEnabled = window.matchMedia(
      '(min-width: 769px) and (prefers-reduced-motion: no-preference)'
    ).matches;
    mouseParallaxEnabled = parallaxEnabled;

    if (parallaxScene) {
      parallaxScene.classList.toggle('no-parallax', !parallaxEnabled);
    }

    if (parallaxEnabled) {
      window.addEventListener('scroll', onParallaxScroll, { passive: true });
      hero.addEventListener('mousemove', onMouseMove, { passive: true });
      updateParallax();
    } else {
      window.removeEventListener('scroll', onParallaxScroll);
      if (hero) hero.removeEventListener('mousemove', onMouseMove);
      parallaxLayers.forEach((layer) => {
        layer.style.transform = '';
      });
      if (heroContent) heroContent.style.opacity = '1';
    }
  }

  initParallax();

  /* ============================================
     6. HERO PHOTO INTERACTION
     ============================================ */
  if (heroImageRing) {
    function resetHeroPhoto() {
      heroImageRing.style.transform = '';
    }

    heroImageRing.addEventListener('pointermove', (event) => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) return;

      const rect = heroImageRing.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      heroImageRing.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 8}deg) translateY(-8px)`;
    });

    heroImageRing.addEventListener('pointerleave', resetHeroPhoto);
    heroImageRing.addEventListener('click', () => {
      heroImageRing.classList.toggle('is-active');
    });
    heroImageRing.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        heroImageRing.classList.toggle('is-active');
      }
    });
  }

  /* ============================================
     7. INTERSECTION OBSERVER - Scroll Reveal
     ============================================ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ============================================
     8. CERTIFICATE LIGHTBOX MODAL
     ============================================ */
  function openModal(fullSrc, linkHref) {
    modalImage.src = fullSrc;
    modalImage.alt = 'Certificate Preview';
    modalLink.href = linkHref || '#';

    certModal.classList.add('active');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    certModal.classList.remove('active');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalImage.src = '';
  }

  certCards.forEach((card) => {
    card.addEventListener('click', () => {
      const fullSrc = card.dataset.full;
      const linkHref = card.dataset.link;
      if (fullSrc) openModal(fullSrc, linkHref);
    });
  });

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('active')) {
      closeModal();
    }
  });

  /* ============================================
     9. RESIZE HANDLER
     ============================================ */
  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      closeMenu();
    }
    initParallax();
    handleNavbarScroll();
  });

})();

