"use strict";
(() => {
  const swedish = document.getElementById('book-swedish');
  const english = document.getElementById('book-english');
  const jump = document.getElementById('book-jump');
  const entries = [...document.querySelectorAll('.book-entry')];
  const sections = [...document.querySelectorAll('[data-book-category]')];
  function update() {
    entries.forEach(entry => {
      entry.hidden = !((swedish.checked && entry.dataset.swedish === 'yes') ||
        (english.checked && entry.dataset.english === 'yes'));
    });
    sections.forEach(section => {
      const count = [...section.querySelectorAll('.book-entry')].filter(entry => !entry.hidden).length;
      section.hidden = count === 0;
      section.querySelector('.book-category-count').textContent = `${count} böcker`;
      const link = document.querySelector(`.book-category-links a[href="#${section.id}"]`);
      if (link) link.hidden = !count;
    });
    jump.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Välj titel eller författare …';
    jump.append(placeholder);
    entries.filter(entry => !entry.hidden).sort((a,b) => a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent, 'sv')).forEach(entry => {
      const option = document.createElement('option');
      option.value = entry.id;
      option.textContent = `${entry.querySelector('h3').textContent} – ${entry.querySelector('.book-author').textContent}`;
      jump.append(option);
    });
    const count = entries.filter(entry => !entry.hidden).length;
    document.getElementById('book-count').textContent = count ? `Visar ${count} av ${entries.length} böcker. Öppna en kategori eller välj en bok direkt.` : 'Inga böcker visas. Välj svenska och/eller engelska.';
  }
  function reveal(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const entry = target.matches('.book-entry') ? target : null;
    if (entry && entry.hidden) {
      if (entry.dataset.swedish === 'yes') swedish.checked = true;
      else english.checked = true;
      update();
    }
    const section = target.closest('[data-book-category]');
    if (section) section.querySelector('.book-category').open = true;
    if (target.scrollIntoView) target.scrollIntoView({block:'start', behavior:'smooth'});
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('.book-category-links a[href^="#"], a[href^="#bok-"]');
    if (link) reveal(link.getAttribute('href').slice(1));
  });
  jump.addEventListener('change', () => {
    if (!jump.value) return;
    const id = jump.value;
    reveal(id);
    if (window.history?.replaceState) window.history.replaceState(null, '', '#' + id);
  });
  swedish.addEventListener('change', update);
  english.addEventListener('change', update);
  window.addEventListener('hashchange', () => reveal(decodeURIComponent(window.location.hash.slice(1))));
  // Keep anchor targets below the sticky controls on narrow and wide screens.
  const browser = document.querySelector('.book-browser');
  function measure() {
    document.body.style.setProperty('--book-browser-height', `${browser.getBoundingClientRect().height + 16}px`);
  }
  if (window.ResizeObserver) new window.ResizeObserver(measure).observe(browser);
  update();
  if (browser.getBoundingClientRect) measure();
  if (window.location?.hash) reveal(decodeURIComponent(window.location.hash.slice(1)));
})();
