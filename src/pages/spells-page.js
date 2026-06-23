import { loadData } from '../utils/fetch-data.js';
import { fetchSpell } from '../services/api.js';
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';

export async function renderSpellsPage(outlet, match) {
  const isDetail = !!match?.[1];
  if (isDetail) return renderSpellDetail(outlet, match[1]);

  let spells;
  try {
    spells = await loadData('spells');
  } catch {
    outlet.innerHTML = `<div class="loading-state"><h2>${t('common.error')}</h2></div>`;
    return;
  }

  const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const levelNames = {
    0: t('spells.cantrip'), 1: t('spells.levelFormat', { n: 1 }),
    2: t('spells.levelFormat', { n: 2 }), 3: t('spells.levelFormat', { n: 3 }),
    4: t('spells.levelFormat', { n: 4 }), 5: t('spells.levelFormat', { n: 5 }),
    6: t('spells.levelFormat', { n: 6 }), 7: t('spells.levelFormat', { n: 7 }),
    8: t('spells.levelFormat', { n: 8 }), 9: t('spells.levelFormat', { n: 9 }),
  };

  const schools = [...new Set(spells.map(s => s.school).filter(Boolean))];
  const allClasses = [...new Set(spells.flatMap(s => s.classes ?? []).filter(Boolean))].sort();

  const byLevel = {};
  for (const spell of spells) {
    const lvl = spell.level ?? 0;
    if (!byLevel[lvl]) byLevel[lvl] = [];
    byLevel[lvl].push(spell);
  }

  const section = document.createElement('section');
  section.className = 'container';

  section.innerHTML = `
    <nav class="breadcrumb"><a href="/" data-nav>${t('nav.home')}</a> / <span>${t('spells.title')}</span></nav>
    <div class="page-header"><h1 class="page-title">${t('spells.title')}</h1><p>${t('spells.count', { n: spells.length })}</p></div>

    <div class="scroll-x" style="margin-bottom:var(--spacing-md,1rem);">
      <div style="display:flex;gap:var(--spacing-sm,0.5rem);justify-content:center;min-width:max-content;padding:0.25rem 0;" id="levelFilters">
        ${levels.map(lvl => `
          <button class="filter-btn level-filter" data-level="${lvl}" style="flex-shrink:0;background:transparent;color:var(--color-primary,#8b0000);border:2px solid var(--color-primary,#8b0000);">
            ${levelNames[lvl]} (${(byLevel[lvl] || []).length})
          </button>
        `).join('')}
        <button class="filter-btn level-filter active" data-level="all" style="flex-shrink:0;background:var(--color-primary,#8b0000);color:#fff;border:2px solid var(--color-primary,#8b0000);">
          ${t('spells.all')} (${spells.length})
        </button>
      </div>
    </div>

    <div class="scroll-x" style="margin-bottom:var(--spacing-sm,0.5rem);">
      <div style="display:flex;gap:var(--spacing-sm,0.5rem);justify-content:center;min-width:max-content;padding:0.25rem 0;" id="schoolFilters">
        <button class="filter-btn school-filter active" data-school="all" style="flex-shrink:0;background:var(--color-accent,#daa520);color:#2c1810;border:1px solid var(--color-accent,#daa520);font-size:0.8rem;">
          ${t('spells.all')}
        </button>
        ${schools.map(school => `
          <button class="filter-btn school-filter" data-school="${escapeHtml(school)}" style="flex-shrink:0;background:transparent;color:var(--color-accent,#daa520);border:1px solid var(--color-accent,#daa520);font-size:0.8rem;">
            ${escapeHtml(school)}
          </button>
        `).join('')}
      </div>
    </div>

    ${allClasses.length > 0 ? `
    <div class="scroll-x" style="margin-bottom:var(--spacing-xl,2rem);">
      <div style="display:flex;gap:var(--spacing-sm,0.5rem);justify-content:center;min-width:max-content;padding:0.25rem 0;" id="classFilters">
        <button class="filter-btn class-filter active" data-class="all" style="flex-shrink:0;background:var(--color-primary,#8b0000);color:#fff;border:2px solid var(--color-primary,#8b0000);">
          ${t('spells.all')}
        </button>
        ${allClasses.map(cls => `
          <button class="filter-btn class-filter" data-class="${escapeHtml(cls)}" style="flex-shrink:0;background:transparent;color:var(--color-primary,#8b0000);border:2px solid var(--color-primary,#8b0000);">
            ${escapeHtml(cls)}
          </button>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div class="card-grid" id="spellGrid"></div>
  `;

  const grid = section.querySelector('#spellGrid');
  let currentLevel = 'all';
  let currentSchool = 'all';
  let currentClass = 'all';

  function getFiltered() {
    let result = spells;
    if (currentLevel !== 'all') {
      result = result.filter(s => s.level === parseInt(currentLevel, 10));
    }
    if (currentSchool !== 'all') {
      result = result.filter(s => s.school === currentSchool);
    }
    if (currentClass !== 'all') {
      result = result.filter(s => (s.classes ?? []).includes(currentClass));
    }
    return result;
  }

  async function renderGrid() {
    grid.innerHTML = '';
    const filtered = getFiltered();

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="text-align:center;color:var(--color-text-muted,#6b5a4a);padding:2rem;">${t('spells.notFound')}</p>`;
      return;
    }

    const BATCH_SIZE = 50;
    for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
      const batch = filtered.slice(i, i + BATCH_SIZE);
      await new Promise(resolve => requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        for (const spell of batch) {
          const card = document.createElement('dnd-spell-card');
          card.setAttribute('slug', spell.slug ?? spell.id ?? '');
          card.setAttribute('name', spell.name);
          card.setAttribute('level', spell.level ?? 0);
          card.setAttribute('school', spell.school || '');
          card.setAttribute('casting-time', spell.castingTime || '');
          card.setAttribute('range', spell.range || '');
          card.setAttribute('duration', spell.duration || '');
          card.setAttribute('description', spell.description || '');
          card.setAttribute('concentration', String(!!spell.concentration));
          card.setAttribute('ritual', String(!!spell.ritual));
          fragment.appendChild(card);
        }
        grid.appendChild(fragment);
        resolve();
      }));
    }
  }

  function updateActiveGroup(buttons, activeClass, styleType) {
    const isLevel = styleType === 'level';
    buttons.forEach(b => {
      b.style.background = 'transparent';
      b.style.color = isLevel ? 'var(--color-primary,#8b0000)' : (styleType === 'school' ? 'var(--color-accent,#daa520)' : 'var(--color-primary,#8b0000)');
    });
    const active = section.querySelector(`.${activeClass}.active`);
    if (active) {
      active.style.background = isLevel ? 'var(--color-primary,#8b0000)' : (styleType === 'school' ? 'var(--color-accent,#daa520)' : 'var(--color-primary,#8b0000)');
      active.style.color = isLevel ? '#fff' : (styleType === 'school' ? '#2c1810' : '#fff');
    }
  }

  section.querySelectorAll('.level-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('.level-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateActiveGroup(section.querySelectorAll('.level-filter'), 'level-filter', 'level');
      currentLevel = btn.dataset.level;
      renderGrid();
    });
  });

  section.querySelectorAll('.school-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('.school-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateActiveGroup(section.querySelectorAll('.school-filter'), 'school-filter', 'school');
      currentSchool = btn.dataset.school;
      renderGrid();
    });
  });

  section.querySelectorAll('.class-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('.class-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateActiveGroup(section.querySelectorAll('.class-filter'), 'class-filter', 'class');
      currentClass = btn.dataset.class;
      renderGrid();
    });
  });

  outlet.appendChild(section);
  renderGrid();
}

async function renderSpellDetail(outlet, slug) {
  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let spell;
  try {
    spell = await fetchSpell(slug);
  } catch {
    outlet.innerHTML = `<div class="loading-state"><h2>${t('common.error')}</h2><p>${t('common.errorMsg')}</p><a href="/magias" data-nav>← ${t('common.back')}</a></div>`;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';
  section.innerHTML = `
    <nav class="breadcrumb"><a href="/" data-nav>${t('nav.home')}</a> / <a href="/magias" data-nav>${t('spells.title')}</a> / <span>${escapeHtml(spell.name)}</span></nav>
    <div class="detail-content">
      <h1 class="page-title">${escapeHtml(spell.name)}</h1>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:var(--spacing-lg,1.5rem);">
        <span class="tag tag-primary">${spell.level === 0 ? t('spells.cantrip') : t('spells.levelFormat', { n: spell.level })} · ${escapeHtml(spell.school)}</span>
        ${spell.concentration ? `<span class="tag">${t('spells.concentration')}</span>` : ''}
        ${spell.ritual ? `<span class="tag">${t('spells.ritual')}</span>` : ''}
      </div>

      <div class="stat-block">
        <div class="stat-row"><span class="stat-label">${t('spells.castingTime')}</span><span>${escapeHtml(spell.castingTime)}</span></div>
        <div class="stat-row"><span class="stat-label">${t('spells.range')}</span><span>${escapeHtml(spell.range)}</span></div>
        <div class="stat-row"><span class="stat-label">${t('spells.components')}</span><span>${spell.components.length > 0 ? escapeHtml(spell.components.join(', ')) : '—'}${spell.material ? ` (${escapeHtml(spell.material)})` : ''}</span></div>
        <div class="stat-row"><span class="stat-label">${t('spells.duration')}</span><span>${escapeHtml(spell.duration)}</span></div>
      </div>

      ${spell.damage ? `
      <div class="stat-block">
        <h2 class="subsection-title">${t('spells.damage')}</h2>
        ${spell.damage.damageType ? `<div class="stat-row"><span class="stat-label">${t('spells.damageType')}</span><span>${escapeHtml(spell.damage.damageType)}</span></div>` : ''}
        ${spell.damage.damageAtSlotLevel ? `<div class="stat-row"><span class="stat-label">${t('spells.level')}</span><span style="text-align:right;">${Object.entries(spell.damage.damageAtSlotLevel).map(([lvl, dice]) => `${lvl}º: ${dice}`).join(', ')}</span></div>` : ''}
        ${spell.damage.damageAtCharacterLevel ? `<div class="stat-row"><span class="stat-label">${t('spells.level')}</span><span style="text-align:right;">${Object.entries(spell.damage.damageAtCharacterLevel).map(([lvl, dice]) => `${lvl}º: ${dice}`).join(', ')}</span></div>` : ''}
      </div>
      ` : ''}

      ${spell.dc ? `
      <div class="stat-block">
        <h2 class="subsection-title">${t('spells.dc')}</h2>
        <div class="stat-row"><span class="stat-label">${t('spells.dcType')}</span><span>${escapeHtml(spell.dc.dcType || '')}</span></div>
        ${spell.dc.dcSuccess ? `<div class="stat-row"><span class="stat-label">${t('spells.dcSuccess')}</span><span>${escapeHtml(spell.dc.dcSuccess)}</span></div>` : ''}
        ${spell.dc.desc ? `<div class="stat-row"><span class="stat-label">${t('spells.description')}</span><span>${escapeHtml(spell.dc.desc)}</span></div>` : ''}
      </div>
      ` : ''}

      ${spell.areaOfEffect ? `
      <div class="stat-block">
        <h2 class="subsection-title">${t('spells.areaOfEffect')}</h2>
        <div class="stat-row"><span class="stat-label">${t('spells.areaType')}</span><span>${escapeHtml(spell.areaOfEffect.type)}</span></div>
        <div class="stat-row"><span class="stat-label">${t('spells.areaSize')}</span><span>${escapeHtml(String(spell.areaOfEffect.size))}</span></div>
      </div>
      ` : ''}

      ${spell.attackType ? `
      <div class="stat-block">
        <div class="stat-row"><span class="stat-label">${t('spells.attackType')}</span><span>${escapeHtml(spell.attackType)}</span></div>
      </div>
      ` : ''}

      <div class="feature-block">
        <h3>${t('spells.description')}</h3>
        <div class="feature-desc">${escapeHtml(spell.description).replace(/\n/g, '<br>')}</div>
      </div>

      ${spell.higherLevel ? `
      <div class="feature-block">
        <h3>${t('spells.higherLevel')}</h3>
        <div class="feature-desc">${escapeHtml(spell.higherLevel).replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      ${spell.classes.length > 0 ? `
      <div style="margin-top:var(--spacing-lg,1.5rem);">
        <h2 class="subsection-title">${t('spells.classes')}</h2>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:var(--spacing-sm,0.5rem);">
          ${spell.classes.map(c => `<span class="tag tag-primary">${escapeHtml(c)}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      ${spell.subclasses.length > 0 ? `
      <div style="margin-top:var(--spacing-lg,1.5rem);margin-bottom:var(--spacing-xl,2rem);">
        <h2 class="subsection-title">${t('spells.subclasses')}</h2>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:var(--spacing-sm,0.5rem);">
          ${spell.subclasses.map(sc => `<span class="tag">${escapeHtml(sc)}</span>`).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  `;
  outlet.appendChild(section);
}
