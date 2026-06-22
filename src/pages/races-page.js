import { fetchRaces, fetchRace, fetchBatch } from '../services/api.js';
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';

export async function renderRacesPage(outlet, match) {
  const isDetail = !!match?.[1];

  if (isDetail) {
    return renderRaceDetail(outlet, match[1]);
  }

  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let data;
  try {
    data = await fetchRaces();
  } catch {
    outlet.innerHTML = `
      <div class="error-state">
        <h2>${t('common.error')}</h2>
        <p>${t('common.errorMsg')}</p>
      </div>
    `;
    return;
  }

  const races = data.results || [];

  const section = document.createElement('section');
  section.className = 'container';

  section.innerHTML = `
    <nav class="breadcrumb">
      <a href="/" data-nav>${t('nav.home')}</a> / <span>${t('races.title')}</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">${t('races.title')}</h1>
      <p>${t('races.count', { n: races.length })}</p>
    </div>

    <div class="card-grid" id="raceGrid">
    </div>
  `;

  const grid = section.querySelector('#raceGrid');

  for (const race of races) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3 class="card-title">${escapeHtml(race.name)}</h3>
      <p class="card-meta">${escapeHtml(race.index)}</p>
    `;

    card.addEventListener('click', () => {
      history.pushState(null, '', `/racas/${race.index}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    grid.appendChild(card);
  }

  fetchBatch(
    races.map(r => r.index),
    (index) => fetchRace(index),
    10
  ).then(results => {
    for (const { item, value: full } of results) {
      if (!full) continue;
      const cards = grid.querySelectorAll('.card');
      for (const card of cards) {
        const nameEl = card.querySelector('.card-title');
        if (nameEl?.textContent === full.name || nameEl?.textContent === item) {
          const meta = [];
          if (full.size) meta.push(full.size);
          if (full.speed) meta.push(`${full.speed} pés`);
          if (full.subraces?.length) meta.push(`${full.subraces.length} sub-raças`);
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

async function renderRaceDetail(outlet, index) {
  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let race;
  try {
    race = await fetchRace(index);
  } catch {
    outlet.innerHTML = `
      <div class="error-state">
        <h2>${t('common.error')}</h2>
        <p>${t('common.errorMsg')}</p>
        <a href="/racas" data-nav style="color:var(--color-primary,#8b0000);">← ${t('common.back')}</a>
      </div>
    `;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';

  const abHtml = (race.abilityBonuses ?? []).map(ab => `
    <span class="tag">${escapeHtml(ab.name)} +${escapeHtml(String(ab.bonus))}</span>
  `).join('');

  const traitsHtml = (race.traits ?? []).map(t => `
    <li style="color:var(--color-text,#2c1810);">${escapeHtml(t)}</li>
  `).join('');

  const subracesHtml = (race.subraces ?? []).map(s => `
    <a href="/racas/${s.toLowerCase().replace(/\s+/g, '-')}" data-nav
       class="tag tag-primary" style="text-decoration:none;">${escapeHtml(s)}</a>
  `).join('');

  section.innerHTML = `
    <nav class="breadcrumb">
      <a href="/" data-nav>${t('nav.home')}</a> /
      <a href="/racas" data-nav>${t('races.title')}</a> /
      <span>${escapeHtml(race.name)}</span>
    </nav>

    <div class="detail-content">
      <h1 class="page-title" style="margin-bottom:1rem;">${escapeHtml(race.name)}</h1>

      <div class="stat-block">
        ${race.size ? `<div class="stat-row"><strong>${t('monsters.size')}</strong><span>${escapeHtml(race.size)}</span></div>` : ''}
        ${race.speed ? `<div class="stat-row"><strong>${t('races.speed')}</strong><span>${escapeHtml(String(race.speed))} pés</span></div>` : ''}
        ${race.languages?.length ? `<div class="stat-row"><strong>${t('races.languages')}</strong><span>${escapeHtml(race.languages.join(', '))}</span></div>` : ''}
      </div>

      ${race.alignment ? `<p style="margin-bottom:1rem;line-height:1.6;color:var(--color-text,#2c1810);"><strong>Tendência:</strong> ${escapeHtml(race.alignment)}</p>` : ''}
      ${race.age ? `<p style="margin-bottom:1rem;line-height:1.6;color:var(--color-text,#2c1810);"><strong>Idade:</strong> ${escapeHtml(race.age)}</p>` : ''}
      ${race.sizeDescription ? `<p style="margin-bottom:1rem;line-height:1.6;color:var(--color-text,#2c1810);">${escapeHtml(race.sizeDescription)}</p>` : ''}
      ${race.languageDesc ? `<p style="margin-bottom:1.5rem;line-height:1.6;color:var(--color-text,#2c1810);">${escapeHtml(race.languageDesc)}</p>` : ''}

      ${race.abilityBonuses?.length ? `
        <h2 class="section-title" style="margin-top:0;">${t('races.abilityBonuses')}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem;">${abHtml}</div>
      ` : ''}

      ${race.traits?.length ? `
        <h2 class="section-title" style="margin-top:0;">${t('races.traits')}</h2>
        <ul style="padding-left:1.5rem;line-height:2;">${traitsHtml}</ul>
      ` : ''}

      ${race.subraces?.length ? `
        <h2 class="section-title" style="margin-top:0;">${t('races.subraces')}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">${subracesHtml}</div>
      ` : ''}
    </div>
  `;

  outlet.appendChild(section);
}
