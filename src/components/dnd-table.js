/**
 * <dnd-table>
 *
 * Tabela de dados genérica com suporte a cabeçalho e linhas.
 *
 * Atributos:
 *   - columns: JSON array de nomes de colunas
 *   - data: JSON array de arrays (dados das linhas)
 *   - caption: texto opcional de descrição
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      overflow-x: auto;
      margin: var(--spacing-lg, 1.5rem) 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--color-surface, #fff8ec);
      border: 1px solid var(--color-border, #d4c4a8);
      border-radius: var(--radius-md, 8px);
      overflow: hidden;
      font-size: var(--font-size-sm, 0.875rem);
    }

    caption {
      caption-side: top;
      text-align: left;
      font-weight: 700;
      padding: var(--spacing-sm, 0.5rem);
      color: var(--color-text-muted, #6b5a4a);
    }

    thead {
      background: var(--color-primary, #8b0000);
      color: #fff;
    }

    th {
      padding: 0.75rem 0.5rem;
      font-weight: 700;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.15);
      white-space: nowrap;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 0.6rem 0.5rem;
      text-align: center;
      border: 1px solid var(--color-border, #d4c4a8);
    }

    tbody tr:nth-child(even) {
      background: var(--color-bg, #faf3e0);
    }

    tbody tr:hover {
      background: var(--color-surface-hover, #f0e6d0);
    }

    .level-col {
      font-weight: 700;
      color: var(--color-primary, #8b0000);
    }
  </style>

  <table part="table">
    <caption id="caption"></caption>
    <thead part="thead">
      <tr id="headRow"></tr>
    </thead>
    <tbody part="tbody" id="body"></tbody>
  </table>
`;

export class DndTable extends HTMLElement {
  static observedAttributes = ['columns', 'data', 'caption'];

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.#render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.#render();
  }

  #render() {
    const columns = this.#safeParse(this.getAttribute('columns'), []);
    const data = this.#safeParse(this.getAttribute('data'), []);
    const caption = this.getAttribute('caption') || '';

    this.shadowRoot.getElementById('caption').textContent = caption;

    const headRow = this.shadowRoot.getElementById('headRow');
    headRow.innerHTML = columns.map(col =>
      `<th>${this.#escapeHtml(col)}</th>`
    ).join('');

    const body = this.shadowRoot.getElementById('body');
    body.innerHTML = data.map(row =>
      `<tr>${row.map((cell, i) =>
        `<td${i === 0 ? ' class="level-col"' : ''}>${this.#escapeHtml(String(cell ?? '—'))}</td>`
      ).join('')}</tr>`
    ).join('');
  }

  #safeParse(value, fallback) {
    if (!value) return fallback;
    try { return JSON.parse(value); }
    catch { return fallback; }
  }

  #escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

customElements.define('dnd-table', DndTable);
