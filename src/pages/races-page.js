import { fetchRaces, fetchRace } from '../services/api.js';
import { t } from '../i18n/index.js';

export async function renderRacesPage(outlet, match) {
  const isDetail = !!match?.[1];

  if (isDetail) {
    return renderRaceDetail(outlet, match[1]);
  }

  outlet.innerHTML = `<div class="container" style="text-align:center;padding:4rem 1rem;"><h2>Carregando...</h2></div>`;

  let data;
  try {
    data = await fetchRaces();
  } catch {
    outlet.innerHTML = `
      <div class="container" style="text-align:center;padding:4rem 1rem;">
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
    <nav style="padding:var(--spacing-md,1rem) 0;font-size:0.875rem;color:var(--color-text-muted,#6b5a4a);">
      <a href="/" data-nav>${t('nav.home')}</a> / <span>${t('races.title')}</span>
    </nav>

    <div style="text-align:center;padding:var(--spacing-xl,2rem) 0 var(--spacing-md,1rem);">
      <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);">
        ${t('races.title')}
      </h1>
      <p style="color:var(--color-text-muted,#6b5a4a);">${t('races.count', { n: races.length })}</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--spacing-md,1rem);padding-bottom:var(--spacing-2xl,3rem);" id="raceGrid">
    </div>
  `;

  const grid = section.querySelector('#raceGrid');

  for (const race of races) {
    const card = document.createElement('div');
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
        ${race.name}
      </h3>
      <p style="font-size:0.8rem;color:var(--color-text-muted,#6b5a4a);">${race.index}</p>
    `;

    card.addEventListener('click', () => {
      history.pushState(null, '', `/racas/${race.index}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    grid.appendChild(card);

    fetchRace(race.index).then(full => {
      const meta = [];
      if (full.size) meta.push(full.size);
      if (full.speed) meta.push(`${full.speed} pés`);
      if (full.subraces?.length) meta.push(`${full.subraces.length} sub-raças`);
      if (meta.length) {
        const p = card.querySelector('p');
        p.textContent = meta.join(' · ');
      }
    }).catch(() => {});
  }

  outlet.appendChild(section);
}

async function renderRaceDetail(outlet, index) {
  outlet.innerHTML = `<div class="container" style="text-align:center;padding:4rem 1rem;"><h2>Carregando...</h2></div>`;

  let race;
  try {
    race = await fetchRace(index);
  } catch {
    outlet.innerHTML = `
      <div class="container" style="text-align:center;padding:4rem 1rem;">
        <h2>${t('common.error')}</h2>
        <p>${t('common.errorMsg')}</p>
        <a href="/racas" data-nav style="color:var(--color-primary,#8b0000);">← ${t('common.back')}</a>
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
      <a href="/racas" data-nav>${t('races.title')}</a> /
      <span>${race.name}</span>
    </nav>

    <div style="max-width:800px;margin:0 auto;padding:var(--spacing-xl,2rem) 0;">
      <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);margin-bottom:1rem;">
        ${race.name}
      </h1>

      <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);padding:var(--spacing-lg,1.5rem);margin-bottom:1.5rem;">
        ${race.size ? `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);"><strong>${t('monsters.size')}</strong><span>${race.size}</span></div>` : ''}
        ${race.speed ? `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border,#d4c4a8);"><strong>${t('races.speed')}</strong><span>${race.speed} pés</span></div>` : ''}
        ${race.languages?.length ? `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;"><strong>${t('races.languages')}</strong><span>${race.languages.join(', ')}</span></div>` : ''}
      </div>

      ${race.alignment ? `<p style="margin-bottom:1rem;line-height:1.6;color:var(--color-text,#2c1810);"><strong>Tendência:</strong> ${race.alignment}</p>` : ''}
      ${race.age ? `<p style="margin-bottom:1rem;line-height:1.6;color:var(--color-text,#2c1810);"><strong>Idade:</strong> ${race.age}</p>` : ''}
      ${race.sizeDescription ? `<p style="margin-bottom:1rem;line-height:1.6;color:var(--color-text,#2c1810);">${race.sizeDescription}</p>` : ''}
      ${race.languageDesc ? `<p style="margin-bottom:1.5rem;line-height:1.6;color:var(--color-text,#2c1810);">${race.languageDesc}</p>` : ''}

      ${race.abilityBonuses?.length ? `
        <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin:1.5rem 0 0.75rem;">${t('races.abilityBonuses')}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem;">
          ${race.abilityBonuses.map(ab => `
            <span style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-accent,#daa520);border-radius:var(--radius-sm,4px);padding:0.25rem 0.75rem;font-size:0.85rem;">
              ${ab.name} +${ab.bonus}
            </span>
          `).join('')}
        </div>
      ` : ''}

      ${race.traits?.length ? `
        <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin:1.5rem 0 0.75rem;">${t('races.traits')}</h2>
        <ul style="padding-left:1.5rem;line-height:2;">
          ${race.traits.map(t => `<li style="color:var(--color-text,#2c1810);">${t}</li>`).join('')}
        </ul>
      ` : ''}

      ${race.subraces?.length ? `
        <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin:1.5rem 0 0.75rem;">${t('races.subraces')}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          ${race.subraces.map(s => `
            <a href="/racas/${s.toLowerCase().replace(/\s+/g, '-')}" data-nav
               style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-primary,#8b0000);border-radius:var(--radius-sm,4px);padding:0.25rem 0.75rem;font-size:0.85rem;color:var(--color-primary,#8b0000);text-decoration:none;">
              ${s}
            </a>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  outlet.appendChild(section);
}
