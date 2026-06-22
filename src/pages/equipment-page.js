import { fetchEquipment, fetchEquipmentItem, fetchBatch } from '../services/api.js';
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';

export async function renderEquipmentPage(outlet, match) {
  const isDetail = !!match?.[1];

  if (isDetail) {
    return renderEquipmentDetail(outlet, match[1]);
  }

  outlet.innerHTML = `<div class="container" style="text-align:center;padding:4rem 1rem;"><h2>Carregando...</h2></div>`;

  let data;
  try {
    data = await fetchEquipment();
  } catch {
    outlet.innerHTML = `
      <div class="container" style="text-align:center;padding:4rem 1rem;">
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
    <nav style="padding:var(--spacing-md,1rem) 0;font-size:0.875rem;color:var(--color-text-muted,#6b5a4a);">
      <a href="/" data-nav>${t('nav.home')}</a> / <span>${t('equipment.title')}</span>
    </nav>

    <div style="text-align:center;padding:var(--spacing-xl,2rem) 0 var(--spacing-md,1rem);">
      <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);">
        ${t('equipment.title')}
      </h1>
      <p style="color:var(--color-text-muted,#6b5a4a);">${t('equipment.count', { n: equipment.length })}</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--spacing-md,1rem);padding-bottom:var(--spacing-2xl,3rem);" id="equipGrid">
    </div>
  `;

  const grid = section.querySelector('#equipGrid');

  for (const item of equipment) {
    const card = document.createElement('div');
    card.className = 'equip-card';
    card.style.cssText = `
      background: var(--color-surface, #fff8ec);
      border: 1px solid var(--color-border, #d4c4a8);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-md, 1rem);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    card.onmouseover = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 4px 12px var(--color-shadow, rgba(44,24,16,0.1))'; };
    card.onmouseout = () => { card.style.transform = ''; card.style.boxShadow = ''; };

    card.innerHTML = `
      <h3 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-lg,1.125rem);color:var(--color-primary,#8b0000);margin-bottom:0.25rem;">
        ${escapeHtml(item.name)}
      </h3>
      <p style="font-size:0.8rem;color:var(--color-text-muted,#6b5a4a);">${escapeHtml(item.index)}</p>
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
      const cards = grid.querySelectorAll('.equip-card');
      for (const card of cards) {
        const nameEl = card.querySelector('h3');
        if (nameEl?.textContent === full.name || nameEl?.textContent === item) {
          const meta = [];
          if (full.category) meta.push(full.category);
          if (full.cost) meta.push(full.cost);
          if (full.weight) meta.push(`${full.weight} lb`);
          if (meta.length) {
            const p = card.querySelector('p');
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
  outlet.innerHTML = `<div class="container" style="text-align:center;padding:4rem 1rem;"><h2>Carregando...</h2></div>`;

  let item;
  try {
    item = await fetchEquipmentItem(index);
  } catch {
    outlet.innerHTML = `
      <div class="container" style="text-align:center;padding:4rem 1rem;">
        <h2>${t('common.error')}</h2>
        <p>${t('common.errorMsg')}</p>
        <a href="/equipamentos" data-nav style="color:var(--color-primary,#8b0000);">← ${t('common.back')}</a>
      </div>
    `;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';
  section.style.paddingBottom = '3rem';

  section.innerHTML = `
    <nav style="padding:var(--spacing-md,1rem) 0;font-size:0.875rem;color:var(--color-text-muted,#6b5a4a);">
      <a href="/" data-nav>${t('nav.home')}</a> /
      <a href="/equipamentos" data-nav>${t('equipment.title')}</a> /
      <span>${escapeHtml(item.name)}</span>
    </nav>

    <div style="max-width:800px;margin:0 auto;padding:var(--spacing-xl,2rem) 0;">
      <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);margin-bottom:1rem;">
        ${escapeHtml(item.name)}
      </h1>

      <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);padding:var(--spacing-lg,1.5rem);margin-bottom:1.5rem;">
        ${item.category ? `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);"><strong>${t('equipment.category')}</strong><span>${escapeHtml(item.category)}</span></div>` : ''}
        ${item.cost ? `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);"><strong>${t('equipment.cost')}</strong><span>${escapeHtml(item.cost)}</span></div>` : ''}
        ${item.weight ? `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);"><strong>${t('equipment.weight')}</strong><span>${escapeHtml(String(item.weight))} lb</span></div>` : ''}
        ${item.damage ? `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;"><strong>${t('equipment.damage')}</strong><span>${escapeHtml(item.damage.dice)} ${escapeHtml(item.damage.type || '')}</span></div>` : ''}
      </div>

      ${item.description ? `<p style="line-height:1.8;color:var(--color-text,#2c1810);">${escapeHtml(item.description)}</p>` : ''}

      ${item.properties?.length ? `
        <div style="margin-top:1.5rem;">
          <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin-bottom:0.75rem;">${t('equipment.properties')}</h2>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            ${item.properties.map(p => `<span style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-accent,#daa520);border-radius:var(--radius-sm,4px);padding:0.25rem 0.75rem;font-size:0.85rem;">${escapeHtml(p)}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  outlet.appendChild(section);
}
