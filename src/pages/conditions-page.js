import { fetchConditions, fetchCondition } from '../services/api.js';
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';

export async function renderConditionsPage(outlet, match) {
  const isDetail = !!match?.[1];
  if (isDetail) return renderConditionDetail(outlet, match[1]);

  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let data;
  try {
    data = await fetchConditions();
  } catch {
    outlet.innerHTML = `<div class="loading-state"><h2>${t('common.error')}</h2><p>${t('common.errorMsg')}</p></div>`;
    return;
  }

  const items = data.results || [];
  const section = document.createElement('section');
  section.className = 'container';
  section.innerHTML = `
    <nav class="breadcrumb"><a href="/" data-nav>${t('nav.home')}</a> / <span>${t('conditions.title')}</span></nav>
    <div class="page-header"><h1 class="page-title">${t('conditions.title')}</h1><p>${t('conditions.count', { n: items.length })}</p></div>
    <div class="card-grid" id="conditionGrid"></div>
  `;

  const grid = section.querySelector('#conditionGrid');
  for (const cond of items) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3 class="card-title">${escapeHtml(cond.name)}</h3><p class="card-meta">${escapeHtml(cond.index)}</p>`;
    card.addEventListener('click', () => {
      history.pushState(null, '', `/condicoes/${cond.index}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    grid.appendChild(card);
  }

  outlet.appendChild(section);
}

async function renderConditionDetail(outlet, index) {
  outlet.innerHTML = `<div class="loading-state"><h2>${t('common.loading')}</h2></div>`;

  let condition;
  try {
    condition = await fetchCondition(index);
  } catch {
    outlet.innerHTML = `<div class="loading-state"><h2>${t('common.error')}</h2><p>${t('common.errorMsg')}</p><a href="/condicoes" data-nav>← ${t('common.back')}</a></div>`;
    return;
  }

  const section = document.createElement('section');
  section.className = 'container';
  section.innerHTML = `
    <nav class="breadcrumb"><a href="/" data-nav>${t('nav.home')}</a> / <a href="/condicoes" data-nav>${t('conditions.title')}</a> / <span>${escapeHtml(condition.name)}</span></nav>
    <div class="detail-content">
      <h1 class="page-title">${escapeHtml(condition.name)}</h1>
      <div class="feature-block">
        <h3>${t('conditions.title')}</h3>
        <div class="feature-desc">${escapeHtml(condition.desc).replace(/\n/g, '<br>')}</div>
      </div>
    </div>
  `;
  outlet.appendChild(section);
}
