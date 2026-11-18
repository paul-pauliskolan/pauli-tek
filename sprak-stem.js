'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const number = value => new Intl.NumberFormat('sv-SE', {maximumFractionDigits: 2}).format(value);
  function updateEnergy() {
    const count = byId('lamp-count');
    const days = byId('lamp-days');
    const hours = Number(byId('lamp-hours').value);
    byId('hours-label').textContent = `${hours} timmar`;
    if (!count.checkValidity() || !days.checkValidity()) {
      byId('energy-results').textContent = 'Ange ett heltal: 1–100 lampor och 1–366 dagar.';
      return;
    }
    const a = 0.04 * Number(count.value) * hours * Number(days.value);
    const b = a / 4;
    byId('energy-results').innerHTML = `<div class="energy-row"><strong>A · 40 W</strong><div class="energy-track"><div class="energy-bar energy-a"></div></div><span>${number(a)} kWh/år · ${number(a * 2)} kr/år</span></div><div class="energy-row"><strong>B · 10 W</strong><div class="energy-track"><div class="energy-bar energy-b"></div></div><span>${number(b)} kWh/år · ${number(b * 2)} kr/år</span></div><p><strong>Skillnad: ${number(a - b)} kWh och ${number((a - b) * 2)} kr per år.</strong> B använder 75 % mindre energi än A med dessa antaganden.</p>`;
  }
  ['lamp-count', 'lamp-hours', 'lamp-days'].forEach(id => byId(id).addEventListener('input', updateEnergy));
  byId('assemble').addEventListener('click', () => {
    const fields = ['claim', 'evidence', 'reason', 'condition'].map(byId);
    const empty = fields.find(field => !field.value.trim());
    const result = byId('writing-result');
    if (empty) {
      result.textContent = 'Fyll i alla fyra delar. Använd stödfraserna om du behöver hjälp.';
      empty.focus();
      return;
    }
    result.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = 'Din förklaring – läs och granska';
    const paragraph = document.createElement('p');
    paragraph.textContent = fields.map(field => field.value.trim()).join(' ');
    result.append(heading, paragraph);
  });
  byId('print-stem').addEventListener('click', () => window.print());
  updateEnergy();
})();
