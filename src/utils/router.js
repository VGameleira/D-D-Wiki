/**
 * Roteador SPA leve baseado em History API.
 *
 * Gerencia navegação client-side sem recarregar a página,
 * permitindo URLs limpas e navegação por histórico do browser.
 *
 * Uso:
 *   const router = new DndRouter({
 *     '/':        homePage,
 *     '/classes': classesPage,
 *   });
 *   router.init();
 */
export class DndRouter {
  #routes = [];
  #fallback = null;
  #contentOutlet = null;

  /**
   * @param {Array<{pattern: string|RegExp, handler: Function}>} routes
   * @param {Function} [fallback] Handler para rotas não encontradas
   */
  constructor(routes, fallback) {
    this.#routes = routes;
    this.#fallback = fallback;
  }

  /** Inicializa o router: captura cliques em links e escuta popstate */
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

  /** Navega para uma URL sem recarregar */
  navigate(path) {
    history.pushState(null, '', path);
    this.#resolve();
  }

  /** Resolve a rota atual e renderiza o handler correspondente */
  async #resolve() {
    const path = location.pathname;

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
  }
}
