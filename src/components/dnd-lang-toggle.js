import { getLang, setLang } from '../utils/locale.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
    }

    .lang-btn {
      background: none;
      border: 2px solid var(--color-accent, #daa520);
      color: var(--color-accent, #daa520);
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius-sm, 4px);
      font-size: 0.75rem;
      font-family: var(--font-body, serif);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .lang-btn:hover {
      background: var(--color-accent, #daa520);
      color: #2c1810;
    }

    .lang-btn .flag {
      font-size: 1rem;
    }
  </style>

  <button class="lang-btn" id="langBtn" aria-label="Alternar idioma">
    <span class="flag" id="flag">🇧🇷</span>
    <span id="label">PT</span>
  </button>
`;

export class DndLangToggle extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#updateButton();

    this.shadowRoot.getElementById('langBtn')
      .addEventListener('click', () => this.#handleToggle());

    document.addEventListener('lang-change', () => this.#updateButton());
  }

  #handleToggle() {
    const current = getLang();
    setLang(current === 'pt-BR' ? 'en' : 'pt-BR');
  }

  #updateButton() {
    const lang = getLang();
    const flag = this.shadowRoot.getElementById('flag');
    const label = this.shadowRoot.getElementById('label');

    if (lang === 'pt-BR') {
      flag.textContent = '🇧🇷';
      label.textContent = 'PT';
    } else {
      flag.textContent = '🇺🇸';
      label.textContent = 'EN';
    }
  }
}

customElements.define('dnd-lang-toggle', DndLangToggle);
