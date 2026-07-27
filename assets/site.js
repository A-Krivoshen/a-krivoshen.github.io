(function () {
  const body = document.body;
  const root = document.documentElement;
  const langButtons = document.querySelectorAll('.lang-btn');
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('mainNav');
  const year = document.getElementById('year');
  const themeToggle = document.getElementById('themeToggle');
  const themeStatus = document.getElementById('themeStatus');
  const localizedMailtoLinks = document.querySelectorAll('[data-mailto-subject-ru][data-mailto-subject-en]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* —— Language —— */
  function applyLanguage(lang) {
    body.setAttribute('data-current-lang', lang);
    root.lang = lang;
    langButtons.forEach((button) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    localizedMailtoLinks.forEach((link) => {
      const subject = lang === 'en' ? link.dataset.mailtoSubjectEn : link.dataset.mailtoSubjectRu;
      const email = link.href.split('?')[0];
      link.href = `${email}?subject=${encodeURIComponent(subject)}`;
    });
    localStorage.setItem('site-language', lang);
  }

  langButtons.forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang));
  });

  const savedLang = localStorage.getItem('site-language');
  applyLanguage(savedLang === 'en' || savedLang === 'ru' ? savedLang : 'ru');

  /* —— Theme: auto by time of day, manual override —— */
  function themeByHour(date) {
    const hour = (date || new Date()).getHours();
    // Day: 07:00–19:59, Night: 20:00–06:59
    return hour >= 7 && hour < 20 ? 'day' : 'night';
  }

  function applyTheme(theme, source) {
    const value = theme === 'day' ? 'day' : 'night';
    root.setAttribute('data-theme', value);
    body.setAttribute('data-theme', value);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', value === 'night' ? 'true' : 'false');
      themeToggle.setAttribute(
        'aria-label',
        value === 'night' ? 'Switch to day theme' : 'Switch to night theme'
      );
      themeToggle.title = value === 'night' ? 'Day mode' : 'Night mode';
    }
    if (themeStatus) {
      const auto = source === 'auto';
      themeStatus.textContent = auto
        ? (value === 'night' ? 'auto · night' : 'auto · day')
        : (value === 'night' ? 'manual · night' : 'manual · day');
    }
  }

  function initTheme() {
    const saved = localStorage.getItem('site-theme');
    if (saved === 'day' || saved === 'night') {
      applyTheme(saved, 'manual');
      return;
    }
    applyTheme(themeByHour(), 'auto');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'day' ? 'day' : 'night';
      const next = current === 'day' ? 'night' : 'day';
      localStorage.setItem('site-theme', next);
      applyTheme(next, 'manual');
    });

    themeToggle.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      localStorage.removeItem('site-theme');
      applyTheme(themeByHour(), 'auto');
    });
  }

  initTheme();

  // Re-check auto theme on the hour if no manual override
  setInterval(() => {
    if (localStorage.getItem('site-theme')) return;
    applyTheme(themeByHour(), 'auto');
  }, 60 * 1000);

  /* —— Mobile nav —— */
  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
      closeNav();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* —— Matrix rain (subtle, night-friendly) —— */
  function initMatrix() {
    if (reducedMotion) return;
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let columns = 0;
    let drops = [];
    let animationId = 0;
    let lastDraw = 0;
    const charset = '01アイウエオカキクケコｱｲｳｴｵ<>/[]{};:=+*#$';
    const fontSize = 14;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -40);
    }

    function themeColors() {
      const night = root.getAttribute('data-theme') !== 'day';
      return night
        ? { fill: 'rgba(5, 10, 8, 0.08)', text: 'rgba(0, 255, 156, 0.55)', head: 'rgba(200, 255, 230, 0.85)' }
        : { fill: 'rgba(238, 245, 241, 0.12)', text: 'rgba(12, 138, 88, 0.28)', head: 'rgba(8, 90, 62, 0.45)' };
    }

    function draw(ts) {
      animationId = requestAnimationFrame(draw);
      if (ts - lastDraw < 42) return; // ~24fps
      lastDraw = ts;

      const colors = themeColors();
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSize + 'px ui-monospace, monospace';

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const ch = charset[(Math.random() * charset.length) | 0];
        ctx.fillStyle = Math.random() > 0.96 ? colors.head : colors.text;
        ctx.fillText(ch, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.65 + Math.random() * 0.35;
      }
    }

    resize();
    window.addEventListener('resize', () => {
      clearTimeout(window.__matrixResizeTimer);
      window.__matrixResizeTimer = setTimeout(resize, 150);
    });

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        lastDraw = 0;
        animationId = requestAnimationFrame(draw);
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMatrix);
  } else {
    initMatrix();
  }
})();
