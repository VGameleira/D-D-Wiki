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
      }

      .nav-links.open {
        display: flex;
      }
    }
  </style>

  <button class="menu-btn" id="menuBtn" aria-label="Abrir menu" aria-expanded="false">☰</button>
  <ul class="nav-links" id="navLinks" role="navigation" aria-label="Navegação principal">
    <li><a href="/" data-nav>Início</a></li>
    <li><a href="/magias" data-nav>Magias</a></li>
    <li><a href="/monstros" data-nav>Monstros</a></li>
    <li><a href="/equipamentos" data-nav>Equipamentos</a></li>
    <li><a href="/racas" data-nav>Raças</a></li>
    <li><a href="/classes/artificer" data-nav>Artífice</a></li>
    <li><a href="/classes/barbarian" data-nav>Bárbaro</a></li>
    <li><a href="/classes/bard" data-nav>Bardo</a></li>
    <li><a href="/classes/warlock" data-nav>Bruxo</a></li>
    <li><a href="/classes/cleric" data-nav>Clérigo</a></li>
    <li><a href="/classes/druid" data-nav>Druida</a></li>
    <li><a href="/classes/sorcerer" data-nav>Feiticeiro</a></li>
    <li><a href="/classes/fighter" data-nav>Guerreiro</a></li>
    <li><a href="/classes/rogue" data-nav>Ladino</a></li>
    <li><a href="/classes/wizard" data-nav>Mago</a></li>
    <li><a href="/classes/monk" data-nav>Monge</a></li>
    <li><a href="/classes/paladin" data-nav>Paladino</a></li>
    <li><a href="/classes/ranger" data-nav>Patrulheiro</a></li>
    <li><a href="/classes/blood-hunter" data-nav>Caçador de Sangue</a></li>
  </ul>
`;

export class DndNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#setupMobileMenu();
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
