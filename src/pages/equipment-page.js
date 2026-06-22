import { fetchEquipment, fetchEquipmentItem, fetchBatch } from '../services/api.js';
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';

export async function renderEquipmentPage(outlet, match) {
  const isDetail = !!match?.[1];

  if (isDetail) {
    return renderEquipmentDetail(outlet, match[1]);
  }

  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let data;
  try {
    data = await fetchEquipment();
  } catch {
    outlet.innerHTML = `
      <div class="error-state">
        <h2>${t('common.error')}</h2>
        <p>${t('common.errorMsg')}</p>
      </div>
    `;
    return;
  }

  const equipment = data.results || [];

  const section = document.createElement('section');
  section.className = 'container';

  section.innerHTML = `
    <nav class="breadcrumb">
      <a href="/" data-nav>${t('nav.home')}</a> / <span>${t('equipment.title')}</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">${t('equipment.title')}</h1>
      <p>${t('equipment.count', { n: equipment.length })}</p>
    </div>

    <div class="card-grid" id="equipGrid">
    </div>
  `;

  const grid = section.querySelector('#equipGrid');

  for (const item of equipment) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3 class="card-title">${escapeHtml(item.name)}</h3>
      <p class="card-meta">${escapeHtml(item.index)}</p>
    `;

    card.addEventListener('click', () => {
      history.pushState(null, '', `/equipamentos/${item.index}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    grid.appendChild(card);
  }

  fetchBatch(
    equipment.map(e => e.index),
    (index) => fetchEquipmentItem(index),
    10
  ).then(results => {
    for (const { item, value: full } of results) {
      if (!full) continue;
      const cards = grid.querySelectorAll('.card');
      for (const card of cards) {
        const nameEl = card.querySelector('.card-title');
        if (nameEl?.textContent === full.name || nameEl?.textContent === item) {
          const meta = [];
          if (full.category) meta.push(full.category);
          if (full.cost) meta.push(full.cost);
          if (full.weight) meta.push(`${full.weight} lb`);
          if (meta.length) {
            const p = card.querySelector('.card-meta');
            p.textContent = meta.join(' · ');
          }
          break;
        }
      }
    }
  });

  outlet.appendChild(section);
}

async function renderEquipmentDetail(outlet, index) {
  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let item;
  try {
    item = await fetchEquipmentItem(index);
  } catch {
    outlet.innerHTML = `
      <div class="error-state">
        <h2>${t('common.error')}</h2>
        <p>${t('common.errorMsg')}</p>
        <a href="/equipamentos" data-nav style="color:var(--color-primary,#8b0000);">← ${t('common.back')}</a>
      </div>
    `;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';

  section.innerHTML = `
    <nav class="breadcrumb">
      <a href="/" data-nav>${t('nav.home')}</a> /
      <a href="/equipamentos" data-nav>${t('equipment.title')}</a> /
      <span>${escapeHtml(item.name)}</span>
    </nav>

    <div class="detail-content">
      <h1 class="page-title" style="margin-bottom:1rem;">${escapeHtml(item.name)}</h1>

      <div class="stat-block">
        ${item.category ? `<div class="stat-row"><strong>${t('equipment.category')}</strong><span>${escapeHtml(item.category)}</span></div>` : ''}
        ${item.cost ? `<div class="stat-row"><strong>${t('equipment.cost')}</strong><span>${escapeHtml(item.cost)}</span></div>` : ''}
        ${item.weight ? `<div class="stat-row"><strong>${t('equipment.weight')}</strong><span>${escapeHtml(String(item.weight))} lb</span></div>` : ''}
        ${item.damage ? `<div class="stat-row"><strong>${t('equipment.damage')}</strong><span>${escapeHtml(item.damage.dice)} ${escapeHtml(item.damage.type || '')}</span></div>` : ''}
      </div>

      ${item.description ? `<p style="line-height:1.8;color:var(--color-text,#2c1810);">${escapeHtml(item.description)}</p>` : ''}

      ${item.properties?.length ? `
        <div style="margin-top:1.5rem;">
          <h2 class="section-title" style="margin-top:0;">${t('equipment.properties')}</h2>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            ${item.properties.map(p => `<span class="tag">${escapeHtml(p)}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  outlet.appendChild(section);
}
