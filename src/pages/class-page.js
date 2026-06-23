import { loadData } from '../utils/fetch-data.js';
import { escapeHtml } from '../utils/sanitize.js';

const METADATA_NAMES = [
  'Hit Points', 'Hit Dice', 'Proficiencies', 'Equipment',
  'Pontos de Vida', 'Dados de Vida', 'Proficiências', 'Equipamento',
];

function isMetadata(feature) {
  return METADATA_NAMES.some(name =>
    feature.name?.toLowerCase().startsWith(name.toLowerCase())
  );
}

function formatDescription(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => escapeHtml(line))
    .join('<br>');
}

export async function renderClassPage(outlet, match) {
  const slug = match[1];

  let classes;
  try {
    classes = await loadData('classes');
  } catch {
    outlet.innerHTML = `<div class="loading-state"><h2>Erro ao carregar dados</h2></div>`;
    return;
  }

  const cls = classes.find(c => c.slug === slug);

  if (!cls) {
    outlet.innerHTML = `
      <div class="error-state">
        <h2>Classe não encontrada</h2>
        <p>A classe "${escapeHtml(slug)}" não foi encontrada.</p>
        <a href="/" data-nav style="color:var(--color-accent,#daa520);">← Voltar ao início</a>
      </div>
    `;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';

  section.innerHTML = `
    <nav class="breadcrumb">
      <a href="/" data-nav>Início</a> / <span>${escapeHtml(cls.name)}</span>
    </nav>
  `;

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `
    <h1 class="page-title">${escapeHtml(cls.name)}</h1>
    ${cls.image ? `<figure style="margin:var(--spacing-lg,1.5rem) auto;max-width:min(400px,100%);">
      <img src="${escapeHtml(cls.image)}" alt="${escapeHtml(cls.name)}" style="width:100%;height:auto;border-radius:var(--radius-md,8px);box-shadow:0 4px 12px var(--color-shadow,rgba(44,24,16,0.1));" loading="lazy" />
    </figure>` : ''}
    <p class="page-subtitle" style="max-width:700px;margin:0 auto;line-height:1.6;">
      ${escapeHtml(cls.description || '')}
    </p>
  `;
  section.appendChild(header);

  if (cls.progressionTable?.columns && cls.progressionTable?.rows) {
    const table = document.createElement('dnd-table');
    table.setAttribute('columns', JSON.stringify(cls.progressionTable.columns));
    table.setAttribute('data', JSON.stringify(cls.progressionTable.rows));
    table.setAttribute('caption', `Tabela de progressão — ${escapeHtml(cls.name)}`);
    section.appendChild(table);
  }

  const metadataFeatures = (cls.features || []).filter(isMetadata);
  if (metadataFeatures.length > 0) {
    const metaDiv = document.createElement('div');
    metaDiv.innerHTML = `
      <h2 class="section-title">Informações da Classe</h2>
      <div class="card-grid" style="padding-bottom:0;">
        ${metadataFeatures.map(f => `
          <div class="card" style="cursor:default;">
            <h3 class="subsection-title">${escapeHtml(f.name)}</h3>
            <div style="font-size:0.875rem;line-height:1.6;color:var(--color-text,#2c1810);">${formatDescription(f.description)}</div>
          </div>
        `).join('')}
      </div>
    `;
    section.appendChild(metaDiv);
  }

  const classFeatures = (cls.features || []).filter(f => !isMetadata(f));
  if (classFeatures.length > 0) {
    const featuresSection = document.createElement('div');
    featuresSection.innerHTML = `
      <h2 class="section-title">Características de Classe</h2>
    `;

    for (const feature of classFeatures) {
      const article = document.createElement('article');
      article.className = 'feature-block';
      article.innerHTML = `
        <h3>
          ${escapeHtml(feature.name)}
          ${feature.level ? `<span class="feature-level">(nvl. ${escapeHtml(String(feature.level))})</span>` : ''}
        </h3>
        <div class="feature-desc">${formatDescription(feature.description)}</div>
      `;
      featuresSection.appendChild(article);
    }

    section.appendChild(featuresSection);
  }

  if (cls.subclasses?.length > 0) {
    const subSection = document.createElement('div');
    subSection.innerHTML = `
      <h2 class="section-title">Subclasses (${cls.subclasses.length})</h2>
      <div class="card-grid" style="padding-bottom:3rem;">
        ${cls.subclasses.map(sc => `
          <div class="card" style="cursor:default;">
            <h3 class="card-title" style="font-size:1rem;color:var(--color-accent,#daa520);">${escapeHtml(sc.name)}</h3>
            ${sc.source ? `<span class="card-meta">${escapeHtml(sc.source)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    section.appendChild(subSection);
  }

  outlet.appendChild(section);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
