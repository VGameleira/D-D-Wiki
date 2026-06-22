import { loadData } from '../utils/fetch-data.js';

const STATIC_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/magias', label: 'Magias' },
  { href: '/monstros', label: 'Monstros' },
  { href: '/equipamentos', label: 'Equipamentos' },
  { href: '/racas', label: 'Raças' },
  { href: '/talentos', label: 'Talentos' },
  { href: '/condicoes', label: 'Condições' },
];

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      align-items: center;
    }

    .nav-links {
      display: flex;
      gap: var(--spacing-sm, 0.5rem);
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-links a {
      color: #e8ddd0;
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm, 4px);
      font-size: 0.875rem;
      transition: background-color 0.2s, color 0.2s;
      white-space: nowrap;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background-color: var(--color-primary, #8b0000);
      color: #fff;
    }

    .nav-links .nav-section {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-accent, #daa520);
      padding: 0.5rem 0.75rem 0.25rem;
      font-weight: 700;
      opacity: 0.7;
    }

    .menu-btn {
      display: none;
      background: none;
      border: none;
      color: var(--color-accent, #daa520);
      font-size: 1.5rem;
      padding: 0.25rem;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .menu-btn {
        display: block;
      }

      .nav-links {
        display: none;
        position: absolute;
        top: var(--header-height, 70px);
        right: 0;
        background: #2c1810;
        flex-direction: column;
        padding: var(--spacing-md, 1rem);
        border-radius: 0 0 var(--radius-md, 8px) var(--radius-md, 8px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        min-width: 220px;
        gap: 0.25rem;
        max-height: 80vh;
        overflow-y: auto;
      }

      .nav-links.open {
        display: flex;
      }
    }
  </style>

  <button class="menu-btn" id="menuBtn" aria-label="Abrir menu" aria-expanded="false">☰</button>
  <ul class="nav-links" id="navLinks" role="navigation" aria-label="Navegação principal">
  </ul>
`;

export class DndNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#setupMobileMenu();
    this.#loadLinks();
  }

  async #loadLinks() {
    const navLinks = this.shadowRoot.getElementById('navLinks');

    for (const link of STATIC_LINKS) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${link.href}" data-nav>${link.label}</a>`;
      navLinks.appendChild(li);
    }

    const sectionLabel = document.createElement('li');
    sectionLabel.className = 'nav-section';
    sectionLabel.textContent = 'Classes';
    navLinks.appendChild(sectionLabel);

    try {
      const classes = await loadData('classes');
      const fragment = document.createDocumentFragment();
      for (const cls of classes) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="/classes/${cls.slug}" data-nav>${cls.name}</a>`;
        fragment.appendChild(li);
      }
      navLinks.appendChild(fragment);
    } catch {
      const fallback = ['artificer', 'barbarian', 'bard', 'warlock', 'cleric', 'druid', 'sorcerer', 'fighter', 'rogue', 'wizard', 'monk', 'paladin', 'ranger', 'blood-hunter'];
      const fallbackNames = ['Artífice', 'Bárbaro', 'Bardo', 'Bruxo', 'Clérigo', 'Druida', 'Feiticeiro', 'Guerreiro', 'Ladino', 'Mago', 'Monge', 'Paladino', 'Patrulheiro', 'Caçador de Sangue'];
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < fallback.length; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="/classes/${fallback[i]}" data-nav>${fallbackNames[i]}</a>`;
        fragment.appendChild(li);
      }
      navLinks.appendChild(fragment);
    }
  }

  #setupMobileMenu() {
    const menuBtn = this.shadowRoot.getElementById('menuBtn');
    const navLinks = this.shadowRoot.getElementById('navLinks');

    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.textContent = isOpen ? '✕' : '☰';
    });

    navLinks.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.textContent = '☰';
    });
  }
}

customElements.define('dnd-navbar', DndNavbar);
