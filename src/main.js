/**
 * Torre do Sábio — Entry Point
 *
 * Inicializa o tema, os Web Components e o roteador SPA.
 */
import { DndRouter } from './utils/router.js';
import { initTheme } from './utils/theme.js';

/* ============================================
 * Importação dos Web Components
 * ============================================ */
import './components/dnd-header.js';
import './components/dnd-navbar.js';
import './components/dnd-footer.js';
import './components/dnd-class-card.js';
import './components/dnd-table.js';
import './components/dnd-spell-card.js';
import './components/dnd-search.js';

/* ============================================
 * Importação das páginas (lazy via function)
 * ============================================ */
import { renderHomePage } from './pages/home.js';
import { renderClassPage } from './pages/class-page.js';
import { renderSpellsPage } from './pages/spells-page.js';
import { renderNotFoundPage } from './pages/not-found.js';

/* ============================================
 * Inicialização
 * ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  const router = new DndRouter(
    [
      { pattern: '/', handler: renderHomePage },
      { pattern: '/magias', handler: renderSpellsPage },
      { pattern: /^\/classes\/([^/]+)$/, handler: renderClassPage },
    ],
    renderNotFoundPage
  );

  router.init();
});
