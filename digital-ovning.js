(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let bookmark = false, inSchool = false;
  let selectedFolder = '';
  const initialFavorites = ['Skrivbord', 'Hämtade filer', 'Kurser', 'Dokument'];
  let favoriteItems = [...initialFavorites];
  const addedFavorites = new Set();
  let selected = null, gesture = null, ghost = null, suppressClick = false;
  const feedback = (kind, text, state = '') => {
    const node = $(kind + '-feedback');
    if (!node) return;
    node.textContent = text; node.className = 'feedback ' + state;
  };
  function clearSelection() {
    selected = null; selectedFolder = '';
    document.body.classList.remove('folder-selected');
    document.querySelectorAll('.selected,.over').forEach(n => n.classList.remove('selected', 'over'));
    document.querySelectorAll('[data-item]').forEach(n => n.setAttribute('aria-pressed', 'false'));
  }
  function select(node) {
    clearSelection(); selected = node.dataset.item; selectedFolder = node.dataset.folder || 'Teknik';
    document.body.classList.toggle('folder-selected', selected === 'folder');
    node.classList.add('selected'); node.setAttribute('aria-pressed', 'true');
    feedback(selected === 'folder' ? 'finder' : 'chrome', 'Valt: ' + node.textContent + '. Välj en målplats eller tryck Escape för att avbryta.');
  }
  function makeButton(slot, text, item, onClick) {
    const button = document.createElement('button'); button.textContent = text;
    if (item) { button.dataset.item = item; button.className = 'drag-item'; button.setAttribute('aria-pressed', 'false'); }
    else { button.className = 'folder-link'; button.addEventListener('click', onClick); }
    $(slot).replaceChildren(button); return button;
  }
  function createBookmark() {
    if (bookmark) { feedback('chrome', 'Bokmärket finns redan. ' + (inSchool ? 'Det ligger i Skola.' : 'Flytta det till Skola.')); return; }
    bookmark = true; $('star').textContent = '★';
    makeButton('bookmark-slot', '★ Teknik', 'bookmark');
    feedback('chrome', 'Bokmärket är skapat! Dra Teknik till mappen Skola.', 'success');
  }
  function showBookmarkInFolder(destination) {
    const content = $('school-content');
    content.replaceChildren();
    const heading = document.createElement('p');
    heading.className = 'bookmark-folder-heading';
    heading.textContent = 'Mappen ' + destination;
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'folder-link bookmark-folder-link';
    const title = document.createElement('strong');
    title.textContent = '★ Teknik – kursens startsida';
    const url = document.createElement('span');
    url.className = 'bookmark-url';
    url.textContent = 'https://skola.example/teknik';
    link.append(title, url);
    link.addEventListener('click', () => feedback('chrome', 'Den sparade adressen öppnar Teknik – kursens startsida i den här simuleringen.', 'success'));
    content.append(heading, link);
  }
  function renderFavorites() {
    const container = $('favorite-slot'); container.replaceChildren();
    favoriteItems.forEach((name, index) => {
      if (index) {
        const gap = document.createElement('button'); gap.className = 'drop-target finder-insertion';
        gap.dataset.target = 'favorites'; gap.dataset.index = index;
        gap.setAttribute('aria-label', 'Släpp mellan ' + favoriteItems[index - 1] + ' och ' + name);
        container.appendChild(gap);
      }
      const row = document.createElement(addedFavorites.has(name) ? 'button' : 'div');
      row.className = 'finder-sidebar-item' + (name === 'Dokument' ? ' current' : '');
      const icon = document.createElement('span'); icon.className = 'finder-folder'; icon.setAttribute('aria-hidden', 'true');
      row.append(icon, document.createTextNode(name));
      if (addedFavorites.has(name)) row.addEventListener('click', () => feedback('finder', 'Genvägen öppnar originalmappen Dokument/' + name + '.', 'success'));
      container.appendChild(row);
    });
  }
  if ($('favorite-slot')) renderFavorites();
  function drop(target, keys = {}, targetNode = null) {
    const name = selectedFolder;
    const item = selected;
    if (!item) { feedback(target === 'bar' || target === 'school' ? 'chrome' : 'finder', 'Välj först adressen, bokmärket eller mappen som du vill dra.', 'error'); return; }
    if (item === 'address' && target === 'bar') createBookmark();
    else if (item === 'bookmark' && target === 'school') {
      inSchool = true; $('bookmark-slot').replaceChildren();
      const destination = targetNode?.dataset.folderName || 'Skola';
      const count = targetNode?.querySelector('.created-folder-count') || $('school-count'); count.textContent = '(1)';
      $('school-content').dataset.destination = destination;
      showBookmarkInFolder(destination);
      feedback('chrome', 'Klart! Bokmärket Teknik ligger nu i ' + destination + '. Klicka på det för att prova länken.', 'success');
    } else if (item === 'folder' && target === 'favorites') {
      if (addedFavorites.has(name)) feedback('finder', name + ' finns redan i Favoriter. Prova en annan mapp.', 'success');
      else {
        const index = Number(targetNode?.dataset.index ?? favoriteItems.length - 1);
        favoriteItems.splice(index, 0, name); addedFavorites.add(name); renderFavorites();
        feedback('finder', 'Genvägen till ' + name + ' är skapad. Originalet ligger kvar i Dokument. Prova en annan mapp.', 'success');
      }
    } else feedback(item === 'folder' ? 'finder' : 'chrome', 'Det är fel mål för detta steg. ' + (item === 'folder' ? 'Dra mappen till ett mellanrum under Favoriter.' : item === 'address' ? 'Dra adressen till den markerade platsen i bokmärkesfältet.' : 'Dra bokmärket till Skola.'), 'error');
    clearSelection();
  }

  const createdFolders = new Set();
  let menuReturnFocus = null;
  function closeBookmarkMenu() {
    $('bookmark-context').hidden = true;
    $('bookmark-menu-button').setAttribute('aria-expanded', 'false');
  }
  function openBookmarkMenu(event) {
    event?.preventDefault(); endGesture(); clearSelection();
    menuReturnFocus = document.activeElement;
    $('bookmark-context').hidden = false;
    $('bookmark-menu-button').setAttribute('aria-expanded', 'true');
    $('context-add-folder').focus();
  }
  if ($('chrome-sim')) {
  $('bookmark-bar').addEventListener('contextmenu', openBookmarkMenu);
  $('bookmark-bar').addEventListener('keydown', event => {
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) openBookmarkMenu(event);
  });
  $('bookmark-menu-button').addEventListener('click', openBookmarkMenu);
  $('context-add-page').addEventListener('click', () => { closeBookmarkMenu(); createBookmark(); $('star').focus(); });
  $('context-add-folder').addEventListener('click', () => {
    closeBookmarkMenu(); $('bookmark-folder-form').reset(); $('folder-name-error').textContent = '';
    $('bookmark-folder-dialog').showModal(); $('bookmark-folder-name').focus();
  });
  $('cancel-bookmark-folder').addEventListener('click', () => $('bookmark-folder-dialog').close());
  $('bookmark-folder-dialog').addEventListener('close', () => $('bookmark-menu-button').focus());
  $('bookmark-folder-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('bookmark-folder-name').value.trim();
    if (!name) { $('folder-name-error').textContent = 'Skriv ett namn på mappen.'; $('bookmark-folder-name').focus(); return; }
    if (['CAD', 'Programmering', 'Skola', ...createdFolders].some(n => n.toLocaleLowerCase('sv') === name.toLocaleLowerCase('sv'))) {
      $('folder-name-error').textContent = 'Den mappen finns redan i övningen. Välj ett annat namn.'; return;
    }
    createdFolders.add(name);
    const button = document.createElement('button'); button.className = 'drop-target chrome-bookmark-folder'; button.dataset.target = 'school'; button.dataset.folderName = name;
    const icon = document.createElement('span'); icon.className = 'chrome-folder-icon'; icon.setAttribute('aria-hidden', 'true');
    const count = document.createElement('span'); count.className = 'created-folder-count'; count.textContent = '(0)';
    button.append(icon, document.createTextNode(name + ' '), count); $('created-folders').appendChild(button);
    $('bookmark-folder-dialog').close(); button.focus();
    feedback('chrome', 'Mappen ”' + name + '” är skapad i bokmärkesfältet. Du kan dra bokmärket Teknik till den.', 'success');
  });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('#bookmark-context, #bookmark-menu-button')) closeBookmarkMenu();
  });
  $('bookmark-context').addEventListener('keydown', event => {
    const options = [$('context-add-page'), $('context-add-folder')];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); options[document.activeElement === options[0] ? 1 : 0].focus();
    }
    if (event.key === 'Tab') closeBookmarkMenu();
  });
  $('star').addEventListener('click', createBookmark);
  }
  document.addEventListener('click', event => {
    if (suppressClick) { suppressClick = false; return; }
    const item = event.target.closest('[data-item]');
    if (item) { select(item); return; }
    const target = event.target.closest('[data-target]');
    if (target) {
      if (!selected && target.dataset.target === 'school') {
        const name = target.dataset.folderName || 'Skola';
        if ($('school-content').dataset.destination === name && inSchool) showBookmarkInFolder(name);
        feedback('chrome', $('school-content').dataset.destination === name && inSchool ? 'I ' + name + ' finns bokmärket Teknik med den sparade webbadressen.' : 'Mappen ' + name + ' är tom. Dra bokmärket Teknik hit.'); return;
      }
      drop(target.dataset.target, event, target);
    }
  });
  function endGesture() {
    if (gesture && gesture.node.hasPointerCapture?.(gesture.id)) gesture.node.releasePointerCapture(gesture.id);
    gesture = null; ghost?.remove(); ghost = null;
    document.querySelectorAll('.over').forEach(n => n.classList.remove('over'));
  }
  document.addEventListener('pointerdown', event => {
    const node = event.target.closest('[data-item]');
    if (!node || event.button !== 0) return;
    gesture = {node, id:event.pointerId, x:event.clientX, y:event.clientY, moving:false};
    node.setPointerCapture(event.pointerId);
  });
  document.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (!gesture.moving && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 6) return;
    if (!gesture.moving) {
      gesture.moving = true; select(gesture.node);
      ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.setAttribute('aria-hidden', 'true');
      ghost.textContent = gesture.node.textContent; document.body.appendChild(ghost);
    }
    ghost.style.left = event.clientX + 12 + 'px'; ghost.style.top = event.clientY + 12 + 'px';
    document.querySelectorAll('.over').forEach(n => n.classList.remove('over'));
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-target]');
    if (target && (target.dataset.target !== 'favorites' || selected === 'folder')) target.classList.add('over');
  });
  document.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const moving = gesture.moving;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-target]');
    endGesture();
    if (moving) {
      suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
      if (target) drop(target.dataset.target, event, target);
      else { feedback(selected === 'folder' ? 'finder' : 'chrome', 'Du släppte utanför målplatsen. Försök igen.', 'error'); clearSelection(); }
    }
  });
  document.addEventListener('pointercancel', () => { endGesture(); clearSelection(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { endGesture(); clearSelection(); if ($('bookmark-context') && !$('bookmark-context').hidden) { closeBookmarkMenu(); (menuReturnFocus || $('bookmark-menu-button')).focus(); } }
  });
  if ($('reset-chrome')) $('reset-chrome').addEventListener('click', () => {
    endGesture(); clearSelection(); bookmark = inSchool = false;
    closeBookmarkMenu(); createdFolders.clear(); $('created-folders').replaceChildren(); delete $('school-content').dataset.destination;
    $('bookmark-slot').replaceChildren(); $('school-content').replaceChildren(); $('school-count').textContent = '(0)'; $('star').textContent = '☆';
    feedback('chrome', 'Dra adressen till bokmärkesfältet eller klicka på stjärnan.');
  });
  if ($('reset-finder')) $('reset-finder').addEventListener('click', () => {
    endGesture(); clearSelection();
    favoriteItems = [...initialFavorites]; addedFavorites.clear(); renderFavorites();
    feedback('finder', 'Dra en av de tre mapparna till ett mellanrum under Favoriter.');
  });

  if ($('dock-sim')) {
    let kept = false;
    const closeDockMenus = () => {
      $('dock-menu').hidden = true; $('dock-options-menu').hidden = true;
      $('dock-app').setAttribute('aria-expanded', 'false'); $('dock-options').setAttribute('aria-expanded', 'false');
    };
    const openDockMenu = event => {
      event.preventDefault(); closeDockMenus(); $('dock-menu').hidden = false;
      $('dock-app').setAttribute('aria-expanded', 'true'); feedback('dock', 'Välj Alternativ.');
      $('dock-options').focus();
    };
    $('dock-app').addEventListener('contextmenu', openDockMenu);
    $('dock-app').addEventListener('click', openDockMenu);
    const openDockOptions = () => {
      $('dock-options-menu').hidden = false; $('dock-options').setAttribute('aria-expanded', 'true');
      feedback('dock', 'Klicka på Behåll i Dock.');
    };
    $('dock-options').addEventListener('mouseenter', openDockOptions);
    $('dock-options').addEventListener('focus', openDockOptions);
    $('dock-options').addEventListener('click', () => { openDockOptions(); $('keep-in-dock').focus(); });
    $('dock-options').addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); openDockOptions(); $('keep-in-dock').focus(); }
    });
    $('keep-in-dock').addEventListener('click', () => {
      kept = true; $('keep-in-dock').setAttribute('aria-checked', 'true'); $('dock-check').style.visibility = 'visible';
      closeDockMenus(); $('dock-app').classList.add('is-kept');
      feedback('dock', 'Klart! Visual Studio Code stannar nu i Dock när appen stängs.', 'success');
    });
    $('reset-dock').addEventListener('click', () => {
      kept = false; closeDockMenus(); $('keep-in-dock').setAttribute('aria-checked', 'false');
      $('dock-check').style.visibility = 'hidden'; $('dock-app').classList.remove('is-kept');
      feedback('dock', 'Högerklicka på Visual Studio Code i Dock.');
    });
    $('dock-check').style.visibility = kept ? 'visible' : 'hidden';
  }
})();
