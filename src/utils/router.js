export class DndRouter {
  #routes = [];
  #fallback = null;
  #contentOutlet = null;
  #resolving = false;

  constructor(routes, fallback) {
    this.#routes = routes;
    this.#fallback = fallback;
  }

  init() {
    this.#contentOutlet = document.getElementById('app-content');
    if (!this.#contentOutlet) {
      console.error('[DndRouter] Elemento #app-content não encontrado');
      return;
    }

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-nav]');
      if (!link) return;
      e.preventDefault();
      this.navigate(link.getAttribute('href'));
    });

    window.addEventListener('popstate', () => this.#resolve());
    this.#resolve();
  }

  navigate(path) {
    history.pushState(null, '', path);
    this.#resolve();
  }

  async #resolve() {
    if (this.#resolving) return;
    this.#resolving = true;

    const path = location.pathname;

    try {
      for (const route of this.#routes) {
        let match = null;

        if (route.pattern instanceof RegExp) {
          match = path.match(route.pattern);
        } else if (typeof route.pattern === 'string') {
          match = path === route.pattern ? [] : null;
        }

        if (match !== null) {
          this.#contentOutlet.innerHTML = '';
          try {
            await route.handler(this.#contentOutlet, match);
          } catch (err) {
            console.error(`[DndRouter] Erro ao renderizar rota "${path}":`, err);
            this.#contentOutlet.innerHTML = `
              <div class="container" style="text-align:center;padding:4rem 1rem;">
                <h2>Erro ao carregar página</h2>
                <p>Algo deu errado. Tente novamente mais tarde.</p>
              </div>
            `;
          }
          return;
        }
      }

      if (this.#fallback) {
        this.#contentOutlet.innerHTML = '';
        this.#fallback(this.#contentOutlet);
      }
    } finally {
      this.#resolving = false;
    }
  }
}
