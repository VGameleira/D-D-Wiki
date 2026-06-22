const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .card {
      background: var(--color-surface, #fff8ec);
      border: 1px solid var(--color-border, #d4c4a8);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-md, 1rem);
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      cursor: pointer;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--color-shadow, rgba(44,24,16,0.1));
    }

    .level-school {
      font-size: 0.75rem;
      color: var(--color-accent, #daa520);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--spacing-xs, 0.25rem);
    }

    .badges {
      display: flex;
      gap: 0.25rem;
      margin-bottom: var(--spacing-xs, 0.25rem);
    }

    .badge {
      display: inline-block;
      background: var(--color-primary, #8b0000);
      color: #fff;
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-sm, 4px);
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .name {
      font-family: var(--font-display, 'Cinzel', serif);
      font-size: var(--font-size-lg, 1.125rem);
      color: var(--color-primary, #8b0000);
      margin-bottom: var(--spacing-sm, 0.5rem);
    }

    .meta {
      font-size: 0.8rem;
      color: var(--color-text-muted, #6b5a4a);
      line-height: 1.8;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
    }

    .meta-label {
      font-weight: 700;
    }

    .description {
      margin-top: var(--spacing-sm, 0.5rem);
      font-size: 0.85rem;
      color: var(--color-text, #2c1810);
      line-height: 1.5;
    }
  </style>

  <div class="card" id="card">
    <div class="badges" id="badges"></div>
    <div class="level-school" id="levelSchool"></div>
    <h3 class="name" id="name"></h3>
    <div class="meta">
      <div class="meta-item">
        <span class="meta-label" id="castingTimeLabel">Conjuração</span>
        <span id="castingTime"></span>
      </div>
      <div class="meta-item">
        <span class="meta-label" id="rangeLabel">Alcance</span>
        <span id="range"></span>
      </div>
      <div class="meta-item">
        <span class="meta-label" id="durationLabel">Duração</span>
        <span id="duration"></span>
      </div>
    </div>
    <div class="description" id="description"></div>
  </div>
`;

export class DndSpellCard extends HTMLElement {
  static observedAttributes = ['name', 'level', 'school', 'casting-time', 'range', 'duration', 'description', 'concentration', 'ritual', 'slug'];

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.#updateContent();
    this.shadowRoot.getElementById('card').addEventListener('click', () => {
      const slug = this.getAttribute('slug') || '';
      if (slug) {
        history.pushState(null, '', `/magias/${slug}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.#updateContent();
  }

  #updateContent() {
    const name = this.getAttribute('name') || '';
    const level = parseInt(this.getAttribute('level') || '0', 10);
    const school = this.getAttribute('school') || '';
    const concentration = this.getAttribute('concentration') === 'true';
    const ritual = this.getAttribute('ritual') === 'true';

    const badges = this.shadowRoot.getElementById('badges');
    badges.innerHTML = '';
    if (concentration) {
      const b = document.createElement('span');
      b.className = 'badge';
      b.textContent = 'Concentração';
      badges.appendChild(b);
    }
    if (ritual) {
      const b = document.createElement('span');
      b.className = 'badge';
      b.textContent = 'Ritual';
      badges.appendChild(b);
    }

    this.shadowRoot.getElementById('levelSchool').textContent =
      level === 0 ? `Truque · ${school}` : `${level}º círculo · ${school}`;
    this.shadowRoot.getElementById('name').textContent = name;
    this.shadowRoot.getElementById('castingTime').textContent = this.getAttribute('casting-time') || '—';
    this.shadowRoot.getElementById('range').textContent = this.getAttribute('range') || '—';
    this.shadowRoot.getElementById('duration').textContent = this.getAttribute('duration') || '—';

    const desc = this.getAttribute('description') || '';
    const descEl = this.shadowRoot.getElementById('description');
    if (desc) {
      descEl.textContent = desc.length > 200 ? desc.slice(0, 200) + '...' : desc;
      descEl.style.display = '';
    } else {
      descEl.style.display = 'none';
    }
  }
}

customElements.define('dnd-spell-card', DndSpellCard);
