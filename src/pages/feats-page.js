import { fetchFeats, fetchFeat } from '../services/api.js';
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';

export async function renderFeatsPage(outlet, match) {
  const isDetail = !!match?.[1];
  if (isDetail) return renderFeatDetail(outlet, match[1]);

  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let data;
  try {
    data = await fetchFeats();
  } catch {
    outlet.innerHTML = `<div class="loading-state"><h2>${t('common.error')}</h2><p>${t('common.errorMsg')}</p></div>`;
    return;
  }

  const items = data.results || [];
  const section = document.createElement('section');
  section.className = 'container';
  section.innerHTML = `
    <nav class="breadcrumb"><a href="/" data-nav>${t('nav.home')}</a> / <span>${t('feats.title')}</span></nav>
    <div class="page-header"><h1 class="page-title">${t('feats.title')}</h1><p>${t('feats.count', { n: items.length })}</p></div>
    <div class="card-grid" id="featGrid"></div>
  `;

  const grid = section.querySelector('#featGrid');
  for (const feat of items) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3 class="card-title">${escapeHtml(feat.name)}</h3><p class="card-meta">${escapeHtml(feat.index)}</p>`;
    card.addEventListener('click', () => {
      history.pushState(null, '', `/talentos/${feat.index}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    grid.appendChild(card);
  }

  outlet.appendChild(section);
}

async function renderFeatDetail(outlet, index) {
  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let feat;
  try {
    feat = await fetchFeat(index);
  } catch {
    outlet.innerHTML = `<div class="loading-state"><h2>${t('common.error')}</h2><p>${t('common.errorMsg')}</p><a href="/talentos" data-nav>← ${t('common.back')}</a></div>`;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';
  section.innerHTML = `
    <nav class="breadcrumb"><a href="/" data-nav>${t('nav.home')}</a> / <a href="/talentos" data-nav>${t('feats.title')}</a> / <span>${escapeHtml(feat.name)}</span></nav>
    <div class="detail-content">
      <h1 class="page-title">${escapeHtml(feat.name)}</h1>

      ${feat.prerequisites.length > 0 ? `
      <div class="stat-block">
        <h2 class="subsection-title">${t('feats.prerequisites')}</h2>
        ${feat.prerequisites.map(p => `
          <div class="stat-row"><span class="stat-label">${t('feats.abilityScore')}</span><span>${escapeHtml(p.abilityScore)} ${t('feats.minimumScore')}: ${p.minimumScore}</span></div>
        `).join('')}
      </div>
      ` : ''}

      <div class="feature-block">
        <h3>${t('feats.description')}</h3>
        <div class="feature-desc">${escapeHtml(feat.desc).replace(/\n/g, '<br>')}</div>
      </div>
    </div>
  `;
  outlet.appendChild(section);
}
