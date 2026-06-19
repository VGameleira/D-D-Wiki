/**
 * <dnd-header>
 *
 * Cabeçalho principal do site com título e slot para navegação.
 * Uso: <dnd-header><dnd-navbar slot="nav"></dnd-navbar></dnd-header>
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      background: linear-gradient(135deg, #2c1810 0%, #4a2a1a 50%, #2c1810 100%);
      color: #e8ddd0;
      border-bottom: 3px solid var(--color-accent, #daa520);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: var(--max-width, 1200px);
      margin: 0 auto;
      padding: 0 var(--spacing-lg, 1rem);
      height: var(--header-height, 70px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .brand-icon {
      font-size: 1.8rem;
      line-height: 1;
    }

    .brand-text {
      font-family: var(--font-display, 'Cinzel', serif);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-accent, #daa520);
      letter-spacing: 1px;
    }

    .brand-sub {
      font-size: 0.7rem;
      color: var(--color-text-muted, #a89880);
      letter-spacing: 2px;
      text-transform: uppercase;
      display: block;
    }

    .nav-slot {
      display: flex;
      align-items: center;
    }

    .theme-toggle {
      background: none;
      border: 2px solid var(--color-accent, #daa520);
      color: var(--color-accent, #daa520);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 1rem;
      transition: all 0.2s;
    }

    .theme-toggle:hover {
      background: var(--color-accent, #daa520);
      color: #2c1810;
    }

    @media (max-width: 768px) {
      .brand-text {
        font-size: 1.1rem;
      }
      .brand-sub {
        display: none;
      }
    }
  </style>

  <div class="header-inner">
    <a class="brand" href="/" data-nav aria-label="Página inicial">
      <span class="brand-icon">🏰</span>
      <span>
        <span class="brand-text">Torre do Sábio</span>
        <span class="brand-sub">Enciclopédia de D&D 5e</span>
      </span>
    </a>
    <div class="nav-slot">
      <slot name="nav"></slot>
      <button class="theme-toggle" id="themeBtn" aria-label="Alternar tema claro/escuro">🌙</button>
    </div>
  </div>
`;

export class DndHeader extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.shadowRoot.getElementById('themeBtn')
      .addEventListener('click', this.#handleThemeToggle);
  }

  #handleThemeToggle() {
    import('../utils/theme.js').then(({ toggleTheme }) => toggleTheme());
  }
}

customElements.define('dnd-header', DndHeader);
