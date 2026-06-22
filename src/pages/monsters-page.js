import { fetchMonsters, fetchMonster, fetchBatch } from '../services/api.js';
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';
import '../components/dnd-monster-card.js';

export async function renderMonstersPage(outlet, match) {
  const isDetail = !!match?.[1];

  if (isDetail) {
    return renderMonsterDetail(outlet, match[1]);
  }

  outlet.innerHTML = `<div class="container" style="text-align:center;padding:4rem 1rem;"><h2>Carregando...</h2></div>`;

  let data;
  try {
    data = await fetchMonsters();
  } catch {
    outlet.innerHTML = `
      <div class="container" style="text-align:center;padding:4rem 1rem;">
        <h2>${t('common.error')}</h2>
        <p>${t('common.errorMsg')}</p>
      </div>
    `;
    return;
  }

  const monsters = data.results || [];

  const section = document.createElement('section');
  section.className = 'container';

  section.innerHTML = `
    <nav style="padding:var(--spacing-md,1rem) 0;font-size:0.875rem;color:var(--color-text-muted,#6b5a4a);">
      <a href="/" data-nav>${t('nav.home')}</a> / <span>${t('monsters.title')}</span>
    </nav>

    <div style="text-align:center;padding:var(--spacing-xl,2rem) 0 var(--spacing-md,1rem);">
      <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);">
        ${t('monsters.title')}
      </h1>
      <p style="color:var(--color-text-muted,#6b5a4a);">${t('monsters.count', { n: monsters.length })}</p>
    </div>

    <div id="monsterGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--spacing-md,1rem);padding-bottom:var(--spacing-2xl,3rem);">
    </div>
  `;

  const grid = section.querySelector('#monsterGrid');

  for (const mon of monsters) {
    const card = document.createElement('dnd-monster-card');
    card.setAttribute('name', mon.name);
    card.setAttribute('slug', mon.index);
    card.addEventListener('click', () => {
      history.pushState(null, '', `/monstros/${mon.index}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    grid.appendChild(card);
  }

  fetchBatch(
    monsters.map(m => m.index),
    (index) => fetchMonster(index),
    10
  ).then(results => {
    for (const { item, value: full } of results) {
      if (!full) continue;
      const cards = grid.querySelectorAll('dnd-monster-card');
      for (const card of cards) {
        if (card.getAttribute('slug') === item) {
          card.setAttribute('size', full.size || '');
          card.setAttribute('type', full.type || '');
          card.setAttribute('armor-class', full.armorClass ?? '');
          card.setAttribute('hit-points', full.hitPoints ?? '');
          card.setAttribute('speed', typeof full.speed === 'object' ? JSON.stringify(full.speed) : (full.speed || ''));
          card.setAttribute('challenge-rating', full.challengeRating ?? '');
          break;
        }
      }
    }
  });

  outlet.appendChild(section);
}

async function renderMonsterDetail(outlet, index) {
  outlet.innerHTML = `<div class="container" style="text-align:center;padding:4rem 1rem;"><h2>Carregando...</h2></div>`;

  let monster;
  try {
    monster = await fetchMonster(index);
  } catch {
    outlet.innerHTML = `
      <div class="container" style="text-align:center;padding:4rem 1rem;">
        <h2>${t('common.error')}</h2>
        <p>${t('common.errorMsg')}</p>
        <a href="/monstros" data-nav style="color:var(--color-primary,#8b0000);">← ${t('common.back')}</a>
      </div>
    `;
    return;
  }

  const speedStr = typeof monster.speed === 'object'
    ? Object.entries(monster.speed).map(([k, v]) => `${k} ${v}`).join(', ')
    : monster.speed || '—';

  const section = document.createElement('section');
  section.className = 'container';
  section.style.paddingBottom = '3rem';

  const traitsHtml = (monster.traits ?? []).map(trait => `
    <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);padding:var(--spacing-md,1rem);margin-bottom:0.75rem;">
      <strong style="color:var(--color-accent,#daa520);">${escapeHtml(trait.name)}.</strong>
      <span style="color:var(--color-text,#2c1810);font-size:0.9rem;">${escapeHtml(trait.description)}</span>
    </div>
  `).join('');

  const actionsHtml = (monster.actions ?? []).map(action => `
    <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);padding:var(--spacing-md,1rem);margin-bottom:0.75rem;">
      <strong style="color:var(--color-accent,#daa520);">${escapeHtml(action.name)}.</strong>
      <span style="color:var(--color-text,#2c1810);font-size:0.9rem;">${escapeHtml(action.description)}</span>
    </div>
  `).join('');

  const legActionsHtml = (monster.legendaryActions ?? []).map(action => `
    <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);padding:var(--spacing-md,1rem);margin-bottom:0.75rem;">
      <strong style="color:var(--color-accent,#daa520);">${escapeHtml(action.name)}.</strong>
      <span style="color:var(--color-text,#2c1810);font-size:0.9rem;">${escapeHtml(action.description)}</span>
    </div>
  `).join('');

  const abilitiesHtml = ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(ab => `
    <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-sm,4px);text-align:center;padding:0.75rem 0.25rem;">
      <div style="text-transform:uppercase;font-size:0.7rem;color:var(--color-text-muted,#6b5a4a);font-weight:700;">${ab.toUpperCase()}</div>
      <div style="font-size:1.25rem;font-weight:700;color:var(--color-primary,#8b0000);">${escapeHtml(String(monster.abilities?.[ab] ?? '—'))}</div>
    </div>
  `).join('');

  section.innerHTML = `
    <nav style="padding:var(--spacing-md,1rem) 0;font-size:0.875rem;color:var(--color-text-muted,#6b5a4a);">
      <a href="/" data-nav>${t('nav.home')}</a> /
      <a href="/monstros" data-nav>${t('monsters.title')}</a> /
      <span>${escapeHtml(monster.name)}</span>
    </nav>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;padding:var(--spacing-xl,2rem) 0;">
      <div>
        <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);margin-bottom:0.5rem;">
          ${escapeHtml(monster.name)}
        </h1>
        <p style="font-size:1rem;color:var(--color-text-muted,#6b5a4a);margin-bottom:1.5rem;font-style:italic;">
          ${escapeHtml(monster.size)} ${escapeHtml(monster.type)}${monster.alignment ? `, ${escapeHtml(monster.alignment)}` : ''}
        </p>

        <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);padding:var(--spacing-lg,1.5rem);">
          <div class="stat-row" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);">
            <strong>${t('monsters.armorClass')}</strong>
            <span>${escapeHtml(String(monster.armorClass ?? '—'))}</span>
          </div>
          <div class="stat-row" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);">
            <strong>${t('monsters.hitPoints')}</strong>
            <span>${escapeHtml(String(monster.hitPoints ?? '—'))} (${escapeHtml(monster.hitDice || '')})</span>
          </div>
          <div class="stat-row" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);">
            <strong>${t('monsters.speed')}</strong>
            <span>${escapeHtml(speedStr)}</span>
          </div>
          <div class="stat-row" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);">
            <strong>${t('monsters.challengeRating')}</strong>
            <span>${escapeHtml(String(monster.challengeRating ?? '—'))}${monster.xp ? ` (${escapeHtml(String(monster.xp))} XP)` : ''}</span>
          </div>
          <div class="stat-row" style="display:flex;justify-content:space-between;padding:0.5rem 0;">
            <strong>${t('monsters.languages')}</strong>
            <span style="text-align:right;">${escapeHtml(monster.languages || '—')}</span>
          </div>
        </div>

        <div style="margin-top:1.5rem;">
          <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin-bottom:1rem;">${t('monsters.abilities')}</h2>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:0.5rem;">
            ${abilitiesHtml}
          </div>
        </div>
      </div>

      <div>
        ${monster.image ? `<img src="${escapeHtml(monster.image)}" alt="${escapeHtml(monster.name)}" style="width:100%;border-radius:var(--radius-md,8px);margin-bottom:1.5rem;" />` : ''}

        ${monster.traits?.length ? `
          <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin-bottom:1rem;">${t('monsters.traits')}</h2>
          ${traitsHtml}
        ` : ''}

        ${monster.actions?.length ? `
          <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin:1.5rem 0 1rem;">${t('monsters.actions')}</h2>
          ${actionsHtml}
        ` : ''}

        ${monster.legendaryActions?.length ? `
          <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin:1.5rem 0 1rem;">${t('monsters.legendaryActions')}</h2>
          ${legActionsHtml}
        ` : ''}
      </div>
    </div>
  `;

  outlet.appendChild(section);
}
