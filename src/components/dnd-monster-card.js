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

    .meta {
      font-size: 0.75rem;
      color: var(--color-accent, #daa520);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--spacing-xs, 0.25rem);
    }

    .name {
      font-family: var(--font-display, 'Cinzel', serif);
      font-size: var(--font-size-lg, 1.125rem);
      color: var(--color-primary, #8b0000);
      margin-bottom: var(--spacing-sm, 0.5rem);
    }

    .stats {
      font-size: 0.8rem;
      color: var(--color-text-muted, #6b5a4a);
      line-height: 1.8;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .stat-label {
      font-weight: 700;
    }

    .cr-badge {
      display: inline-block;
      background: var(--color-primary, #8b0000);
      color: #fff;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm, 4px);
      font-size: 0.75rem;
      font-weight: 700;
      margin-top: var(--spacing-xs, 0.25rem);
    }
  </style>

  <div class="card">
    <div class="meta" id="meta"></div>
    <h3 class="name" id="name"></h3>
    <div class="stats">
      <div class="stat-row">
        <span class="stat-label">CA</span>
        <span id="armorClass"></span>
      </div>
      <div class="stat-row">
        <span class="stat-label">PV</span>
        <span id="hitPoints"></span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Deslocamento</span>
        <span id="speed"></span>
      </div>
    </div>
    <div class="cr-badge" id="crBadge"></div>
  </div>
`;

export class DndMonsterCard extends HTMLElement {
  static observedAttributes = ['name', 'size', 'type', 'armor-class', 'hit-points', 'speed', 'challenge-rating'];

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.#updateContent();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.#updateContent();
  }

  #updateContent() {
    const size = this.getAttribute('size') || '';
    const type = this.getAttribute('type') || '';

    this.shadowRoot.getElementById('meta').textContent =
      size && type ? `${size} · ${type}` : (size || type);
    this.shadowRoot.getElementById('name').textContent = this.getAttribute('name') || '';
    this.shadowRoot.getElementById('armorClass').textContent = this.getAttribute('armor-class') || '—';
    this.shadowRoot.getElementById('hitPoints').textContent = this.getAttribute('hit-points') || '—';

    const speedRaw = this.getAttribute('speed');
    if (speedRaw) {
      try {
        const speedObj = JSON.parse(speedRaw);
        this.shadowRoot.getElementById('speed').textContent =
          speedObj.walk ?? '—';
      } catch {
        this.shadowRoot.getElementById('speed').textContent = speedRaw;
      }
    } else {
      this.shadowRoot.getElementById('speed').textContent = '—';
    }

    const cr = this.getAttribute('challenge-rating');
    this.shadowRoot.getElementById('crBadge').textContent = cr ? `ND ${cr}` : '';
  }
}

customElements.define('dnd-monster-card', DndMonsterCard);
