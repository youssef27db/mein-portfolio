// script.js
// --------------------------------------------------
// Interaktionen:
// - Dark mode (System + Toggle)
// - Mobile Navigation (Hamburger)
// - Smooth Scroll + aktives Hervorheben der Nav-Links
// - Skill-Balken Animation
// - Einfaches Formular-Feedback (lokal)
// --------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Element-Referenzen
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  const progressElems = document.querySelectorAll('.progress');
  const contactForm = document.getElementById('contact-form');
  const yearEl = document.getElementById('year');

  // Jahr im Footer setzen
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --------------------------
     Dark Mode: System + Toggle
     -------------------------- */
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    root.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  } else {
    root.setAttribute('data-theme', 'light');
    themeToggle.textContent = '🌙';
  }

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  /* --------------------------
     Mobile Nav: öffnen/schließen
     -------------------------- */
  hamburger.addEventListener('click', () => {
    const open = mobileNav.getAttribute('aria-hidden') === 'false';
    const nextOpen = !open;
    mobileNav.setAttribute('aria-hidden', String(!open));
    mobileNav.classList.toggle('open');
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    // Prevent body scroll when mobile nav is open (improves mobile UX)
    try{
      if (nextOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        // Ensure any horizontal scroll is reset when closing
        window.scrollTo(0, window.pageYOffset || 0);
      }
    }catch(e){ /* fail silently on older browsers */ }
  });

  // Schließe Mobile Nav beim Klick auf Link
  mobileLinks.forEach(l => l.addEventListener('click', () => {
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    // Re-enable scrolling after closing mobile nav and reset horizontal scroll
    try{ document.body.style.overflow = ''; window.scrollTo(0, window.pageYOffset || 0); }catch(e){}
  }));

  /* --------------------------
     Smooth Scroll für interne Links
     -------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const offset = -16; // kleines Offset
      const top = target.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* --------------------------
     Aktive Nav beim Scrollen (IntersectionObserver)
     -------------------------- */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (entry.isIntersecting) {
        navLinks.forEach(n => n.classList.remove('active'));
        if (navLink) navLink.classList.add('active');
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(sec => sectionObserver.observe(sec));

  /* --------------------------
     Skill-Bar Animation (IntersectionObserver)
     -------------------------- */
  const progressObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const prog = entry.target;
        const bar = prog.querySelector('.progress-bar');
        const label = prog.querySelector('.progress-value');
        const target = parseInt(prog.getAttribute('data-skill')) || 0;
        bar.style.width = target + '%';
        if (label) label.textContent = target + '%';
        obs.unobserve(prog);
      }
    });
  }, { threshold: 0.25 });

  progressElems.forEach(p => progressObserver.observe(p));

  /* --------------------------
     Reveal animations (IntersectionObserver)
     Adds `.in-view` to elements with `.reveal` when visible
     -------------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const revealObserver = new IntersectionObserver((entries, ro) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    // Mark common targets as reveal elements
    // Hero: staggered children
    const heroLeft = document.querySelector('.hero-left');
    if (heroLeft) {
      const children = Array.from(heroLeft.children).filter(n => n.nodeType === 1);
      children.forEach((c, i) => { c.classList.add('reveal'); c.setAttribute('data-delay', String(Math.min(3, Math.floor(i/1)+1))); revealObserver.observe(c); });
    }

    // All sections and cards
    document.querySelectorAll('.section, .about-card, .project, .timeline-item, .contact-card, .hero-right').forEach(el => {
      el.classList.add('reveal'); revealObserver.observe(el);
    });
  }

  /* Small stagger for profile rings so they don't start all at once */
  const rings = document.querySelectorAll('.photo-ring');
  rings.forEach((r, idx) => { r.style.animationDelay = (idx * 220) + 'ms'; });

  /* --------------------------
     Kontaktformular (Demo)
     -------------------------- */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Danke! Dieses Formular ist lokal. Ergänze ein Backend, um echte Nachrichten zu empfangen.');
      contactForm.reset();
    });
  }

  /* --------------------------
     Accessibility: ESC schließt Mobile Nav
     -------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      mobileNav.setAttribute('aria-hidden', 'true');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      try{ document.body.style.overflow = ''; window.scrollTo(0, window.pageYOffset || 0); }catch(e){}
    }
  });
});
