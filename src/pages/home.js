import { loadData } from '../utils/fetch-data.js';

export async function renderHomePage(outlet) {
  let classes;
  try {
    classes = await loadData('classes');
  } catch {
    outlet.innerHTML = `
      <div class="error-state">
        <h2>Erro ao carregar dados</h2>
        <p>Não foi possível carregar as classes. Tente novamente mais tarde.</p>
      </div>
    `;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';
  section.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🏰 Torre do Sábio</h1>
      <p class="page-subtitle">Enciclopédia de Dungeons &amp; Dragons 5ª edição em português</p>
    </div>

    <div class="card-grid" id="classGrid">
    </div>
  `;

  const grid = section.querySelector('#classGrid');

  for (const cls of classes) {
    const card = document.createElement('dnd-class-card');
    card.setAttribute('slug', cls.slug);
    card.setAttribute('name', cls.name);
    card.setAttribute('description', cls.shortDescription || cls.description?.slice(0, 200) || '');
    card.setAttribute('img', cls.image || '/img/classes/' + cls.slug + '.png');
    grid.appendChild(card);
  }

  outlet.appendChild(section);
}
