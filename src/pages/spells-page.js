/**
 * Página de magias — grade filtrada por nível, escola, nome.
 */
import { loadData } from '../utils/fetch-data.js';

/**
 * Renderiza a página de listagem de magias.
 * @param {HTMLElement} outlet
 */
export async function renderSpellsPage(outlet) {
  let spells;
  try {
    spells = await loadData('spells');
  } catch {
    outlet.innerHTML = `<div class="container" style="text-align:center;padding:4rem 1rem;"><h2>Erro ao carregar magias</h2></div>`;
    return;
  }

  const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const levelNames = {
    0: 'Truques', 1: '1º Círculo', 2: '2º Círculo', 3: '3º Círculo',
    4: '4º Círculo', 5: '5º Círculo', 6: '6º Círculo', 7: '7º Círculo',
    8: '8º Círculo', 9: '9º Círculo',
  };

  /* Agrupa magias por nível */
  const byLevel = {};
  for (const spell of spells) {
    const lvl = spell.level ?? 0;
    if (!byLevel[lvl]) byLevel[lvl] = [];
    byLevel[lvl].push(spell);
  }

  const section = document.createElement('section');
  section.className = 'container';

  section.innerHTML = `
    <nav style="padding:var(--spacing-md,1rem) 0;font-size:0.875rem;color:var(--color-text-muted,#6b5a4a);">
      <a href="/" data-nav>Início</a> / <span>Magias</span>
    </nav>

    <div style="text-align:center;padding:var(--spacing-xl,2rem) 0 var(--spacing-md,1rem);">
      <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);">
        Magias
      </h1>
      <p style="color:var(--color-text-muted,#6b5a4a);">${spells.length} magias disponíveis</p>
    </div>

    <div style="display:flex;gap:var(--spacing-sm,0.5rem);flex-wrap:wrap;justify-content:center;margin-bottom:var(--spacing-xl,2rem);" id="levelFilters">
      ${levels.map(lvl => `
        <button class="level-filter" data-level="${lvl}" style="padding:0.5rem 1rem;border:2px solid var(--color-primary,#8b0000);background:transparent;color:var(--color-primary,#8b0000);border-radius:var(--radius-md,8px);cursor:pointer;font-family:var(--font-body,serif);font-weight:700;transition:all 0.2s;">
          ${levelNames[lvl]} (${(byLevel[lvl] || []).length})
        </button>
      `).join('')}
      <button class="level-filter active" data-level="all" style="padding:0.5rem 1rem;border:2px solid var(--color-primary,#8b0000);background:var(--color-primary,#8b0000);color:#fff;border-radius:var(--radius-md,8px);cursor:pointer;font-family:var(--font-body,serif);font-weight:700;transition:all 0.2s;">
        Todas (${spells.length})
      </button>
    </div>

    <div id="spellGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--spacing-md,1rem);padding-bottom:var(--spacing-2xl,3rem);">
    </div>
  `;

  const grid = section.querySelector('#spellGrid');

  async function renderSpells(level) {
    grid.innerHTML = '';
    const filtered = level === 'all'
      ? spells
      : spells.filter(s => s.level === parseInt(level, 10));

    if (filtered.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--color-text-muted,#6b5a4a);padding:2rem;">Nenhuma magia encontrada neste nível.</p>';
      return;
    }

    const BATCH_SIZE = 50;
    for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
      const batch = filtered.slice(i, i + BATCH_SIZE);
      await new Promise(resolve => requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        for (const spell of batch) {
          const card = document.createElement('dnd-spell-card');
          card.setAttribute('name', spell.name);
          card.setAttribute('level', spell.level ?? 0);
          card.setAttribute('school', spell.school || '');
          card.setAttribute('casting-time', spell.castingTime || '');
          card.setAttribute('range', spell.range || '');
          card.setAttribute('duration', spell.duration || '');
          card.setAttribute('description', spell.description || '');
          fragment.appendChild(card);
        }
        grid.appendChild(fragment);
        resolve();
      }));
    }
  }

  /* Filtros de nível */
  const filterBtns = section.querySelectorAll('.level-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.style.background = 'transparent';
        b.style.color = 'var(--color-primary,#8b0000)';
      });
      btn.style.background = 'var(--color-primary,#8b0000)';
      btn.style.color = '#fff';
      renderSpells(btn.dataset.level);
    });
  });

  outlet.appendChild(section);

  /* Renderiza tudo inicialmente */
  renderSpells('all');
}
