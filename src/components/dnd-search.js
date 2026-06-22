/**
 * <dnd-search>
 *
 * Barra de busca com sugestões ao digitar.
 *
 * Atributos:
 *   - placeholder: texto do placeholder
 *   - data-src: endpoint JSON para busca
 *
 * Eventos:
 *   - 'search-results': disparado com os resultados
 *   - 'search-input': disparado quando o texto muda
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
    }

    .search-wrapper {
      display: flex;
      align-items: center;
      background: var(--color-surface, #fff8ec);
      border: 2px solid var(--color-border, #d4c4a8);
      border-radius: var(--radius-md, 8px);
      padding: 0 var(--spacing-md, 1rem);
      transition: border-color 0.2s;
    }

    .search-wrapper:focus-within {
      border-color: var(--color-accent, #daa520);
    }

    .search-icon {
      font-size: 1.2rem;
      margin-right: var(--spacing-sm, 0.5rem);
      color: var(--color-text-muted, #6b5a4a);
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 0.75rem 0;
      font-family: var(--font-body, serif);
      font-size: var(--font-size-base, 1rem);
      color: var(--color-text, #2c1810);
      outline: none;
    }

    input::placeholder {
      color: var(--color-text-muted, #6b5a4a);
      opacity: 0.7;
    }

    .clear-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: var(--color-text-muted, #6b5a4a);
      cursor: pointer;
      padding: 0.25rem;
      display: none;
    }

    .clear-btn.visible {
      display: block;
    }

    .results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--color-surface, #fff8ec);
      border: 1px solid var(--color-border, #d4c4a8);
      border-top: none;
      border-radius: 0 0 var(--radius-md, 8px) var(--radius-md, 8px);
      max-height: 300px;
      overflow-y: auto;
      display: none;
      z-index: 50;
      box-shadow: 0 4px 12px var(--color-shadow, rgba(44,24,16,0.1));
    }

    .results.visible {
      display: block;
    }

    .result-item {
      padding: 0.75rem var(--spacing-md, 1rem);
      cursor: pointer;
      border-bottom: 1px solid var(--color-border, #d4c4a8);
      transition: background 0.15s;
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .result-item:hover {
      background: var(--color-surface-hover, #f0e6d0);
    }

    .result-item h4 {
      font-family: var(--font-display, 'Cinzel', serif);
      font-size: 0.95rem;
      color: var(--color-primary, #8b0000);
    }

    .result-item p {
      font-size: 0.8rem;
      color: var(--color-text-muted, #6b5a4a);
    }

    .no-results {
      padding: var(--spacing-md, 1rem);
      text-align: center;
      color: var(--color-text-muted, #6b5a4a);
      font-size: 0.9rem;
    }
  </style>

  <div class="search-wrapper">
    <span class="search-icon">🔍</span>
    <input type="search" id="searchInput" autocomplete="off" />
    <button class="clear-btn" id="clearBtn" aria-label="Limpar busca">✕</button>
  </div>
  <div class="results" id="results"></div>
`;

export class DndSearch extends HTMLElement {
  static observedAttributes = ['placeholder', 'data-src'];

  #data = [];
  #debounceTimer = null;

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#setup();
  }

  async #setup() {
    const input = this.shadowRoot.getElementById('searchInput');
    const clearBtn = this.shadowRoot.getElementById('clearBtn');
    const results = this.shadowRoot.getElementById('results');

    input.placeholder = this.getAttribute('placeholder') || 'Buscar magias, classes, itens...';

    try {
      const dataSrc = this.getAttribute('data-src');
      if (dataSrc) {
        const res = await fetch(dataSrc);
        this.#data = await res.json();
      }
    } catch { /* dados podem não estar disponíveis */ }

    input.addEventListener('input', () => {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = setTimeout(() => this.#search(input.value, results), 200);
      clearBtn.classList.toggle('visible', input.value.length > 0);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      results.classList.remove('visible');
      clearBtn.classList.remove('visible');
      input.focus();
      this.#dispatchEvent('search-input', '');
    });

    input.addEventListener('blur', () => {
      setTimeout(() => results.classList.remove('visible'), 200);
    });

    input.addEventListener('focus', () => {
      if (input.value.length >= 2) this.#search(input.value, results);
    });
  }

  #search(query, resultsEl) {
    const q = query.toLowerCase().trim();
    if (q.length < 2) {
      resultsEl.classList.remove('visible');
      this.#dispatchEvent('search-input', q);
      return;
    }

    const matches = this.#data.filter(item => {
      const name = (item.name || '').toLowerCase();
      const slug = (item.slug || '').toLowerCase();
      return name.includes(q) || slug.includes(q);
    }).slice(0, 10);

    this.#dispatchEvent('search-input', q);

    if (matches.length === 0) {
      resultsEl.innerHTML = '<div class="no-results">Nenhum resultado encontrado</div>';
      resultsEl.classList.add('visible');
      return;
    }

    resultsEl.innerHTML = matches.map(item => `
      <a class="result-item" href="/classes/${item.slug || item.name}" data-nav style="display:block;text-decoration:none;color:inherit;">
        <h4>${item.name || item.slug}</h4>
        <p>${item.shortDescription?.slice(0, 100) || ''}</p>
      </a>
    `).join('');
    resultsEl.classList.add('visible');
  }

  #dispatchEvent(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  }

  disconnectedCallback() {
    clearTimeout(this.#debounceTimer);
  }
}

customElements.define('dnd-search', DndSearch);
