(function () {
  const body = document.body;
  const langButtons = document.querySelectorAll('.lang-btn');
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('mainNav');
  const year = document.getElementById('year');
  const savedLang = localStorage.getItem('site-language');

  function applyLanguage(lang) {
    body.setAttribute('data-current-lang', lang);
    document.documentElement.lang = lang;
    langButtons.forEach((button) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    localStorage.setItem('site-language', lang);
  }

  langButtons.forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang));
  });

  if (savedLang === 'en' || savedLang === 'ru') {
    applyLanguage(savedLang);
  } else {
    applyLanguage('ru');
  }

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (year) {
    year.textContent = new Date().getFullYear();
  }
})();
