/**
 * <dnd-class-card>
 *
 * Card de classe para exibição na homepage.
 *
 * Atributos:
 *   - slug: identificador único (ex: 'barbaro')
 *   - name: nome da classe
 *   - description: texto de descrição curta
 *   - img: caminho da imagem
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .card {
      display: flex;
      flex-direction: column;
      background: var(--color-surface, #fff8ec);
      border: var(--border-width, 2px) solid var(--color-border, #d4c4a8);
      border-radius: var(--radius-md, 8px);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      height: 100%;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px var(--color-shadow, rgba(44,24,16,0.1));
    }

    .card-image {
      width: 100%;
      height: clamp(160px, 30vw, 200px);
      object-fit: cover;
      border-bottom: 2px solid var(--color-accent, #daa520);
    }

    .card-body {
      padding: var(--spacing-md, 1rem);
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .card-name {
      font-family: var(--font-display, 'Cinzel', serif);
      font-size: var(--font-size-xl, 1.5rem);
      color: var(--color-primary, #8b0000);
      margin-bottom: var(--spacing-sm, 0.5rem);
    }

    .card-desc {
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--color-text-muted, #6b5a4a);
      line-height: 1.5;
      flex: 1;
    }

    .card-link {
      display: inline-block;
      margin-top: var(--spacing-sm, 0.5rem);
      color: var(--color-accent, #daa520);
      font-weight: 700;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>

  <a class="card" id="card" data-nav>
    <img class="card-image" id="cardImg" alt="" loading="lazy" />
    <div class="card-body">
      <h2 class="card-name" id="cardName"></h2>
      <p class="card-desc" id="cardDesc"></p>
      <span class="card-link">Explorar →</span>
    </div>
  </a>
`;

export class DndClassCard extends HTMLElement {
  static observedAttributes = ['slug', 'name', 'description', 'img'];

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.#updateContent();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.#updateContent();
  }

  #updateContent() {
    const slug = this.getAttribute('slug');
    const name = this.getAttribute('name') || '';
    const description = this.getAttribute('description') || '';
    const img = this.getAttribute('img') || '';

    const card = this.shadowRoot.getElementById('card');
    card.setAttribute('href', `/classes/${slug}`);

    this.shadowRoot.getElementById('cardImg').src = img;
    this.shadowRoot.getElementById('cardImg').alt = name;
    this.shadowRoot.getElementById('cardName').textContent = name;
    this.shadowRoot.getElementById('cardDesc').textContent = description;
  }
}

customElements.define('dnd-class-card', DndClassCard);
