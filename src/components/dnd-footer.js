/**
 * <dnd-footer>
 *
 * Rodapé do site com informações de licença e autoria.
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      background: linear-gradient(135deg, #2c1810 0%, #4a2a1a 50%, #2c1810 100%);
      color: #a89880;
      border-top: 3px solid var(--color-accent, #daa520);
      padding: var(--spacing-xl, 2rem) var(--spacing-lg, 1rem);
      margin-top: var(--spacing-2xl, 3rem);
      font-size: 0.875rem;
    }

    .footer-inner {
      max-width: var(--max-width, 1200px);
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-md, 1rem);
    }

    a {
      color: var(--color-accent, #daa520);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .footer-brand {
      font-family: var(--font-display, 'Cinzel', serif);
      font-size: 1rem;
      color: var(--color-accent, #daa520);
    }
  </style>

  <div class="footer-inner">
    <span class="footer-brand">🏰 Torre do Sábio</span>
    <span>
      Conteúdo sob <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener">MIT License</a>
    </span>
    <span>
      Feito por <a href="https://github.com/VGameleira" target="_blank" rel="noopener">@VGameleira</a>
    </span>
  </div>
`;

export class DndFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('dnd-footer', DndFooter);
