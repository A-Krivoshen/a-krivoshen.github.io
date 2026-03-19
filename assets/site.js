(function () {
  const body = document.body;
  const langButtons = document.querySelectorAll('.lang-btn');
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('mainNav');
  const year = document.getElementById('year');
  const savedLang = localStorage.getItem('site-language');
  const localizedMailtoLinks = document.querySelectorAll('[data-mailto-subject-ru][data-mailto-subject-en]');

  function applyLanguage(lang) {
    body.setAttribute('data-current-lang', lang);
    document.documentElement.lang = lang;
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
