"use strict";
(() => {
  const toggle = document.getElementById('book-english-only');
  const entries = [...document.querySelectorAll('.book-entry')];
  function update() {
    entries.forEach(entry => { entry.hidden = toggle.checked && entry.dataset.english !== 'yes'; });
    document.querySelectorAll('[data-book-category]').forEach(section => {
      const visible = [...section.querySelectorAll('.book-entry')].some(entry => !entry.hidden);
      section.hidden = !visible;
      const link = document.querySelector(`.stem-jumps a[href="#${section.id}"]`);
      if (link) link.hidden = !visible;
    });
    const count = entries.filter(entry => !entry.hidden).length;
    document.getElementById('book-count').textContent = `Visar ${count} av ${entries.length} böcker${toggle.checked ? ' med verifierad engelsk utgåva' : ''}.`;
  }
  toggle.addEventListener('change', update);
  update();
})();
