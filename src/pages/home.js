/**
 * Página inicial — listagem de todas as classes.
 */
import { loadData } from '../utils/fetch-data.js';

/**
 * Renderiza a homepage.
 * @param {HTMLElement} outlet - Elemento onde renderizar o conteúdo
 */
export async function renderHomePage(outlet) {
  let classes;
  try {
    classes = await loadData('classes');
  } catch {
    outlet.innerHTML = `
      <div class="container" style="text-align:center;padding:4rem 1rem;">
        <h2>Erro ao carregar dados</h2>
        <p>Não foi possível carregar as classes. Tente novamente mais tarde.</p>
      </div>
    `;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';
  section.innerHTML = `
    <div style="text-align:center;padding:var(--spacing-2xl,3rem) 0 var(--spacing-xl,2rem);">
      <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);">
        🏰 Torre do Sábio
      </h1>
      <p style="font-size:var(--font-size-lg,1.125rem);color:var(--color-text-muted,#6b5a4a);margin-top:var(--spacing-md,1rem);">
        Enciclopédia de Dungeons & Dragons 5ª edição em português
      </p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--spacing-lg,1.5rem);padding-bottom:var(--spacing-2xl,3rem);" id="classGrid">
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
