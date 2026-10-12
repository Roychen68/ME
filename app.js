(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.PORTFOLIO_CONFIG;
  const content = window.PORTFOLIO_CONTENT;
  const photos = window.PORTFOLIO_PHOTOS;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const readPreference = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Browser storage is optional. */ } };
  let language = readPreference('roy-language', navigator.language.startsWith('zh') ? 'zh' : 'en');
  if (!content[language]) language = 'en';
  let galleryIndex = 0;
  let loopLocked = false;
  let toastTimeout;
  let navLockUntil = 0;
  const t = (key) => content[language][key] || content.en[key] || key;

  // Attribute-only labels, as well as visible copy, change with the language.
  $$('.project-meta > span').forEach((element, i) => { element.dataset.i18n = `project${i + 1}Meta`; });

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function renderResume() {
    const projectLinks = [
      'https://github.com/Roychen68/Vocabulary',
      'https://github.com/Roychen68/GoldenHandAwardVisiting',
      'https://github.com/Roychen68/world-skills-2025-F-latest'
    ];
    const projects = projectLinks.map((url, index) => `<h3>${t(`cvProject${index + 1}`)}</h3><p>${t(`cvProject${index + 1}Desc`)}</p><a class="cv-project-link" href="${url}" target="_blank" rel="noopener noreferrer">${url.replace('https://', '')}</a>`).join('');
    const markup = `<article class="resume-sheet" lang="${language === 'zh' ? 'zh-Hant' : 'en'}"><header class="cv-heading"><div><h1>Roy<span>.</span></h1><p>${t('cvRole')}</p></div><div class="cv-contacts"><a href="${config.github}" target="_blank" rel="noopener noreferrer">github.com/Roychen68</a><a href="${config.instagram}" target="_blank" rel="noopener noreferrer">instagram.com/roy_webtech</a><span>Discord: ${config.discordUsername}</span></div></header><section class="cv-section"><h2>${t('cvProfile')}</h2><p>${t('cvSummary')}</p></section><section class="cv-section"><h2>${t('cvSkills')}</h2><p>${t('cvSkillList')}</p></section><section class="cv-section"><h2>${t('cvProjects')}</h2>${projects}</section><section class="cv-section"><h2>${t('cvExperience')}</h2><p>${t('cvWSA')}</p><p>${t('cvDream')}</p></section><section class="cv-section"><h2>${t('cvEducation')}</h2><p>${t('cvEducationDesc')}</p></section><footer class="cv-footer">${t('cvFooter')}</footer></article>`;
    $('#resume-preview').innerHTML = markup;
    $('#print-sheet').innerHTML = markup;
  }

  function updatePhoto() {
    const photo = photos[galleryIndex];
    $('#lightbox-image').src = `assets/images/${photo.file}`;
    $('#lightbox-image').alt = photo[language];
    $('#lightbox-caption').textContent = photo[language];
    $('#lightbox-count').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  }

  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next === 'zh' ? 'zh-Hant' : 'en';
    document.title = t('title');
    $('meta[name="description"]').content = t('description');
    $('meta[property="og:title"]').content = t('title');
    $('meta[property="og:description"]').content = t('description');
    $$('[data-i18n]').forEach((element) => { element.innerHTML = t(element.dataset.i18n); });
    $$('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
    $$('[data-i18n-alt]').forEach((element) => { element.setAttribute('alt', t(element.dataset.i18nAlt)); });
    $$('[data-lang]').forEach((button) => {
      const active = button.dataset.lang === language;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('.gallery-item').forEach((figure, index) => {
      const photo = photos[index];
      $('img', figure).alt = photo[language];
      $('.gallery-overlay > span', figure).textContent = photo[language];
      $('button', figure).setAttribute('aria-label', `${photo[language]} ↗`);
    });
    $('.section-nav').setAttribute('aria-label', language === 'zh' ? '章節導覽' : 'Section navigation');
    $$('.section-nav a').forEach((link) => link.setAttribute('aria-label', t($('[data-i18n]', link).dataset.i18n)));
    $('.language-switch').setAttribute('aria-label', language === 'zh' ? '網站語言' : 'Website language');
    $('#loop-hint').textContent = t('loopHint');
    renderResume();
    if ($('#lightbox').open) updatePhoto();
    savePreference('roy-language', next);
  }

  // Three composed thumbnails lead to all five full-resolution photographs.
  const gallery = $('#gallery-grid');
  photos.slice(0, 3).forEach((photo, index) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item reveal';
    figure.innerHTML = `<button type="button" aria-haspopup="dialog"><img src="assets/images/${photo.file}" alt="${photo[language]}" loading="lazy" decoding="async" width="1800" height="1202"><span class="gallery-overlay"><span>${photo[language]}</span><svg class="icon" aria-hidden="true"><use href="#arrow"/></svg></span></button>`;
    $('button', figure).addEventListener('click', () => {
      galleryIndex = index;
      updatePhoto();
      $('#lightbox').showModal();
    });
    gallery.append(figure);
  });
  $('#close-lightbox').addEventListener('click', () => $('#lightbox').close());
  function stepPhoto(direction) { galleryIndex = (galleryIndex + direction + photos.length) % photos.length; updatePhoto(); }
  $('#lightbox-prev').addEventListener('click', () => stepPhoto(-1));
  $('#lightbox-next').addEventListener('click', () => stepPhoto(1));
  $('#lightbox').addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepPhoto(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); stepPhoto(1); }
  });
  $$('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
  $$('[data-lang]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));

  $$('[data-copy-discord]').forEach((button) => button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(config.discordUsername);
      showToast(t('copied'));
    } catch {
      // Fallback for file:// and non-secure hosts. The username stays visible in the contact section.
      showToast(t('copyFallback'));
      const field = document.createElement('textarea');
      field.value = config.discordUsername;
      field.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none';
      document.body.append(field);
      field.select();
      try { if (document.execCommand('copy')) showToast(t('copied')); } catch { /* The username remains visible on the page. */ }
      field.remove();
      button.focus({ preventScroll: true });
    }
  }));
  if (/^\d{15,22}$/.test(config.discordServerId)) {
    const widget = $('#discord-widget');
    const frame = document.createElement('iframe');
    frame.title = 'Discord server widget';
    frame.src = `https://discord.com/widget?id=${config.discordServerId}&theme=dark`;
    frame.loading = 'lazy';
    frame.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts');
    widget.append(frame);
    widget.hidden = false;
  }
  $$('[data-resume]').forEach((button) => button.addEventListener('click', () => $('#resume-dialog').showModal()));
  $('#close-resume').addEventListener('click', () => $('#resume-dialog').close());
  $('#print-resume').addEventListener('click', () => { renderResume(); window.print(); });
  window.addEventListener('beforeprint', renderResume);

  // Native scrolling, no smooth-scroll library or wheel hijacking during the page.
  const sections = $$('.page-section');
  const navLinks = $$('.section-nav a');
  let scrollFrame = false;
  function updateSection() {
    const threshold = window.innerHeight * .38;
    let current = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= threshold) current = index; });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10) current = sections.length - 1;
    navLinks.forEach((link, index) => {
      link.classList.toggle('active', index === current);
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollFrame = false;
  }
  window.addEventListener('scroll', () => { if (!scrollFrame) { scrollFrame = true; requestAnimationFrame(updateSection); } }, { passive: true });
  window.addEventListener('resize', updateSection, { passive: true });
  $$('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
    navLockUntil = performance.now() + 1800;
    if (link.getAttribute('href') === '#home') {
      event.preventDefault();
      history.replaceState(null, '', location.pathname + location.search + '#home');
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  }));

  // Loop only on a fresh gesture AT the end. Footer content is readable before looping.
  const atEnd = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3;
  function canLoop() { return !loopLocked && performance.now() > navLockUntil && !document.querySelector('dialog[open]'); }
  function loopToStart() {
    if (!canLoop() || !atEnd()) return;
    loopLocked = true;
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.classList.add('looping');
    updateSection();
    setTimeout(() => { document.body.classList.remove('looping'); loopLocked = false; }, 1500);
  }
  let lastWheel = 0;
  let wheelWasAtEnd = false;
  let wheelDistance = 0;
  window.addEventListener('wheel', (event) => {
    const now = performance.now();
    if (loopLocked && event.deltaY > 0) { event.preventDefault(); lastWheel = now; return; }
    const freshGesture = now - lastWheel > 180;
    if (freshGesture) { wheelWasAtEnd = atEnd(); wheelDistance = 0; }
    if (event.deltaY < 0) wheelWasAtEnd = false;
    if (wheelWasAtEnd) wheelDistance += Math.max(0, event.deltaY);
    if (wheelDistance >= 36 && wheelWasAtEnd && canLoop()) { event.preventDefault(); loopToStart(); }
    lastWheel = now;
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!['ArrowDown', 'PageDown', ' '].includes(event.key) || !atEnd() || !canLoop()) return;
    if (event.target.closest('a, button, input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    loopToStart();
  });
  let touchY = 0;
  let touchStartedAtEnd = false;
  window.addEventListener('touchstart', (event) => {
    touchY = event.touches[0]?.clientY || 0;
    touchStartedAtEnd = atEnd();
  }, { passive: true });
  window.addEventListener('touchend', (event) => {
    const endY = event.changedTouches[0]?.clientY || 0;
    if (touchStartedAtEnd && touchY - endY > 65) loopToStart();
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    $$('.reveal').forEach((element) => observer.observe(element));
  } else $$('.reveal').forEach((element) => element.classList.add('visible'));

  $('#year').textContent = new Date().getFullYear();
  setLanguage(language);
  updateSection();

  // A brief intro with an upper bound: slow/offline resources cannot trap visitors.
  const loader = $('#loader');
  let loaderDone = false;
  let interval;
  function dismissLoader() {
    if (loaderDone) return;
    loaderDone = true;
    clearInterval(interval);
    $('#load-progress').style.width = '100%';
    $('#load-percent').textContent = '100%';
    loader.classList.add('done');
    document.body.classList.add('intro-ready');
    try { sessionStorage.setItem('roy-intro-seen', '1'); } catch { /* Optional. */ }
  }
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('roy-intro-seen') === '1'; } catch { /* Optional. */ }
  if (introSeen || reducedMotion.matches) dismissLoader();
  else {
    let percent = 0;
    interval = setInterval(() => {
      percent = Math.min(94, percent + 7);
      $('#load-progress').style.width = `${percent}%`;
      $('#load-percent').textContent = `${String(percent).padStart(2, '0')}%`;
    }, 75);
    const finish = () => setTimeout(dismissLoader, 900);
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(dismissLoader, 2200);
  }
  // Decorative SVGs should not add unnamed content to the accessibility tree.
  $$('svg').forEach((svg) => svg.setAttribute('aria-hidden', 'true'));
})();
