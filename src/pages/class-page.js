/**
 * Página de classe individual — exibe todos os detalhes.
 */
import { loadData } from '../utils/fetch-data.js';

const METADATA_NAMES = [
  'Hit Points', 'Hit Dice', 'Proficiencies', 'Equipment',
  'Pontos de Vida', 'Dados de Vida', 'Proficiências', 'Equipamento',
];

/**
 * Verifica se uma feature é metadado (HP, proficiências, etc.).
 */
function isMetadata(feature) {
  return METADATA_NAMES.some(name =>
    feature.name?.toLowerCase().startsWith(name.toLowerCase())
  );
}

/**
 * Renderiza a página de uma classe.
 * @param {HTMLElement} outlet
 * @param {RegExpMatchArray} match - match[1] = slug da classe
 */
export async function renderClassPage(outlet, match) {
  const slug = match[1];

  let classes;
  try {
    classes = await loadData('classes');
  } catch {
    outlet.innerHTML = `<div class="container" style="text-align:center;padding:4rem 1rem;"><h2>Erro ao carregar dados</h2></div>`;
    return;
  }

  const cls = classes.find(c => c.slug === slug);

  if (!cls) {
    outlet.innerHTML = `
      <div class="container" style="text-align:center;padding:4rem 1rem;">
        <h2>Classe não encontrada</h2>
        <p>A classe "${slug}" não foi encontrada.</p>
        <a href="/" data-nav style="color:var(--color-accent,#daa520);">← Voltar ao início</a>
      </div>
    `;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';

  /* Breadcrumb */
    section.innerHTML = `
    <nav style="padding:var(--spacing-md,1rem) 0;font-size:0.875rem;color:var(--color-text-muted,#6b5a4a);">
      <a href="/" data-nav>Início</a> / <span>${escapeHtml(cls.name)}</span>
    </nav>
  `;

  /* Cabeçalho */
  const header = document.createElement('div');
  header.style.cssText = 'text-align:center;padding:var(--spacing-xl,2rem) 0;';
  header.innerHTML = `
    <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:var(--font-size-3xl,2.5rem);color:var(--color-primary,#8b0000);">
      ${escapeHtml(cls.name)}
    </h1>
    ${cls.image ? `<figure style="margin:var(--spacing-lg,1.5rem) auto;max-width:400px;">
      <img src="${escapeHtml(cls.image)}" alt="${escapeHtml(cls.name)}" style="width:100%;height:auto;border-radius:var(--radius-md,8px);box-shadow:0 4px 12px var(--color-shadow,rgba(44,24,16,0.1));" loading="lazy" />
    </figure>` : ''}
    <p style="font-style:italic;color:var(--color-text-muted,#6b5a4a);max-width:700px;margin:0 auto;line-height:1.6;">
      ${escapeHtml(cls.description || '')}
    </p>
  `;
  section.appendChild(header);

  /* Tabela de progressão */
  if (cls.progressionTable?.columns && cls.progressionTable?.rows) {
    const table = document.createElement('dnd-table');
    table.setAttribute('columns', JSON.stringify(cls.progressionTable.columns));
    table.setAttribute('data', JSON.stringify(cls.progressionTable.rows));
    table.setAttribute('caption', `Tabela de progressão — ${cls.name}`);
    section.appendChild(table);
  }

  /* Metadados da classe (HP, Proficiências, Equipamento) */
  const metadataFeatures = (cls.features || []).filter(isMetadata);
  if (metadataFeatures.length > 0) {
    const metaDiv = document.createElement('div');
    metaDiv.innerHTML = `
      <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin:var(--spacing-xl,2rem) 0 var(--spacing-md,1rem);">
        Informações da Classe
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--spacing-md,1rem);margin-bottom:var(--spacing-xl,2rem);">
        ${metadataFeatures.map(f => `
          <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);padding:var(--spacing-md,1rem);">
            <h3 style="font-family:var(--font-display,'Cinzel',serif);font-size:1rem;color:var(--color-accent,#daa520);margin-bottom:var(--spacing-sm,0.5rem);">${escapeHtml(f.name)}</h3>
            <div style="font-size:0.875rem;line-height:1.6;color:var(--color-text,#2c1810);">${formatDescription(f.description)}</div>
          </div>
        `).join('')}
      </div>
    `;
    section.appendChild(metaDiv);
  }

  /* Características de classe (features que não são metadados) */
  const classFeatures = (cls.features || []).filter(f => !isMetadata(f));
  if (classFeatures.length > 0) {
    const featuresSection = document.createElement('div');
    featuresSection.innerHTML = `
      <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin:var(--spacing-xl,2rem) 0 var(--spacing-md,1rem);">
        Características de Classe
      </h2>
    `;

    for (const feature of classFeatures) {
      const article = document.createElement('article');
      article.style.cssText = 'margin-bottom:var(--spacing-lg,1.5rem);padding:var(--spacing-md,1rem);background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);';
      article.innerHTML = `
        <h3 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-accent,#daa520);margin-bottom:var(--spacing-sm,0.5rem);font-size:1.1rem;">
          ${escapeHtml(feature.name)}
          ${feature.level ? `<span style="font-size:0.75rem;color:var(--color-text-muted,#6b5a4a);font-weight:400;margin-left:0.5rem;">(nvl. ${escapeHtml(String(feature.level))})</span>` : ''}
        </h3>
        <div style="font-size:0.9rem;line-height:1.7;color:var(--color-text,#2c1810);">${formatDescription(feature.description)}</div>
      `;
      featuresSection.appendChild(article);
    }

    section.appendChild(featuresSection);
  }

  /* Subclasses */
  if (cls.subclasses?.length > 0) {
    const subSection = document.createElement('div');
    subSection.innerHTML = `
      <h2 style="font-family:var(--font-display,'Cinzel',serif);color:var(--color-primary,#8b0000);margin:var(--spacing-xl,2rem) 0 var(--spacing-md,1rem);">
        Subclasses (${cls.subclasses.length})
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:var(--spacing-md,1rem);margin-bottom:var(--spacing-2xl,3rem);">
        ${cls.subclasses.map(sc => `
          <div style="background:var(--color-surface,#fff8ec);border:1px solid var(--color-border,#d4c4a8);border-radius:var(--radius-md,8px);padding:var(--spacing-md,1rem);">
            <h3 style="font-family:var(--font-display,'Cinzel',serif);font-size:1rem;color:var(--color-accent,#daa520);">${escapeHtml(sc.name)}</h3>
            ${sc.source ? `<span style="font-size:0.75rem;color:var(--color-text-muted,#6b5a4a);">${escapeHtml(sc.source)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    section.appendChild(subSection);
  }

  outlet.appendChild(section);

  /* Scroll suave para o topo */
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

import { escapeHtml } from '../utils/sanitize.js';

/**
 * Formata descrição: quebra linhas com segurança.
 */
function formatDescription(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => escapeHtml(line))
    .join('<br>');
}
