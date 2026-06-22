import { fetchMonsters, fetchMonster, fetchBatch } from '../services/api.js';
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';
import '../components/dnd-monster-card.js';

export async function renderMonstersPage(outlet, match) {
  const isDetail = !!match?.[1];

  if (isDetail) {
    return renderMonsterDetail(outlet, match[1]);
  }

  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let data;
  try {
    data = await fetchMonsters();
  } catch {
    outlet.innerHTML = `
      <div class="error-state">
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
    <nav class="breadcrumb">
      <a href="/" data-nav>${t('nav.home')}</a> / <span>${t('monsters.title')}</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">${t('monsters.title')}</h1>
      <p>${t('monsters.count', { n: monsters.length })}</p>
    </div>

    <div class="card-grid" id="monsterGrid">
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
  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let monster;
  try {
    monster = await fetchMonster(index);
  } catch {
    outlet.innerHTML = `
      <div class="error-state">
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

  const traitsHtml = (monster.traits ?? []).map(trait => `
    <div class="feature-block">
      <strong style="color:var(--color-accent,#daa520);">${escapeHtml(trait.name)}.</strong>
      <span style="color:var(--color-text,#2c1810);font-size:0.9rem;">${escapeHtml(trait.description)}</span>
    </div>
  `).join('');

  const actionsHtml = (monster.actions ?? []).map(action => `
    <div class="feature-block">
      <strong style="color:var(--color-accent,#daa520);">${escapeHtml(action.name)}.</strong>
      <span style="color:var(--color-text,#2c1810);font-size:0.9rem;">${escapeHtml(action.description)}</span>
    </div>
  `).join('');

  const legActionsHtml = (monster.legendaryActions ?? []).map(action => `
    <div class="feature-block">
      <strong style="color:var(--color-accent,#daa520);">${escapeHtml(action.name)}.</strong>
      <span style="color:var(--color-text,#2c1810);font-size:0.9rem;">${escapeHtml(action.description)}</span>
    </div>
  `).join('');

  const abilitiesHtml = ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(ab => `
    <div class="ability-item">
      <div class="ability-label">${ab.toUpperCase()}</div>
      <div class="ability-value">${escapeHtml(String(monster.abilities?.[ab] ?? '—'))}</div>
    </div>
  `).join('');

  section.innerHTML = `
    <nav class="breadcrumb">
      <a href="/" data-nav>${t('nav.home')}</a> /
      <a href="/monstros" data-nav>${t('monsters.title')}</a> /
      <span>${escapeHtml(monster.name)}</span>
    </nav>

    <div class="detail-grid">
      <div>
        <h1 class="page-title" style="margin-bottom:0.5rem;">
          ${escapeHtml(monster.name)}
        </h1>
        <p class="page-subtitle" style="margin-bottom:1.5rem;">
          ${escapeHtml(monster.size)} ${escapeHtml(monster.type)}${monster.alignment ? `, ${escapeHtml(monster.alignment)}` : ''}
        </p>

        <div class="stat-block">
          <div class="stat-row">
            <strong>${t('monsters.armorClass')}</strong>
            <span>${escapeHtml(String(monster.armorClass ?? '—'))}</span>
          </div>
          <div class="stat-row">
            <strong>${t('monsters.hitPoints')}</strong>
            <span>${escapeHtml(String(monster.hitPoints ?? '—'))} (${escapeHtml(monster.hitDice || '')})</span>
          </div>
          <div class="stat-row">
            <strong>${t('monsters.speed')}</strong>
            <span>${escapeHtml(speedStr)}</span>
          </div>
          <div class="stat-row">
            <strong>${t('monsters.challengeRating')}</strong>
            <span>${escapeHtml(String(monster.challengeRating ?? '—'))}${monster.xp ? ` (${escapeHtml(String(monster.xp))} XP)` : ''}</span>
          </div>
          <div class="stat-row">
            <strong>${t('monsters.languages')}</strong>
            <span style="text-align:right;">${escapeHtml(monster.languages || '—')}</span>
          </div>
        </div>

        <div style="margin-top:1.5rem;">
          <h2 class="section-title" style="margin-top:0;">${t('monsters.abilities')}</h2>
          <div class="ability-grid">
            ${abilitiesHtml}
          </div>
        </div>
      </div>

      <div>
        ${monster.image ? `<img src="${escapeHtml(monster.image)}" alt="${escapeHtml(monster.name)}" style="width:100%;border-radius:var(--radius-md,8px);margin-bottom:1.5rem;" />` : ''}

        ${monster.traits?.length ? `
          <h2 class="section-title" style="margin-top:0;">${t('monsters.traits')}</h2>
          ${traitsHtml}
        ` : ''}

        ${monster.actions?.length ? `
          <h2 class="section-title" style="margin:1.5rem 0 1rem;">${t('monsters.actions')}</h2>
          ${actionsHtml}
        ` : ''}

        ${monster.legendaryActions?.length ? `
          <h2 class="section-title" style="margin:1.5rem 0 1rem;">${t('monsters.legendaryActions')}</h2>
          ${legActionsHtml}
        ` : ''}
      </div>
    </div>
  `;

  outlet.appendChild(section);
}
