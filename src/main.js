import { DndRouter } from './utils/router.js';
import { initTheme } from './utils/theme.js';
import { initLocale } from './utils/locale.js';

import './components/dnd-header.js';
import './components/dnd-navbar.js';
import './components/dnd-footer.js';
import './components/dnd-class-card.js';
import './components/dnd-table.js';
import './components/dnd-spell-card.js';
import './components/dnd-search.js';
import './components/dnd-monster-card.js';
import './components/dnd-lang-toggle.js';

import { renderHomePage } from './pages/home.js';
import { renderClassPage } from './pages/class-page.js';
import { renderSpellsPage } from './pages/spells-page.js';
import { renderMonstersPage } from './pages/monsters-page.js';
import { renderEquipmentPage } from './pages/equipment-page.js';
import { renderRacesPage } from './pages/races-page.js';
import { renderFeatsPage } from './pages/feats-page.js';
import { renderConditionsPage } from './pages/conditions-page.js';
import { renderNotFoundPage } from './pages/not-found.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLocale();

  const router = new DndRouter(
    [
      { pattern: '/', handler: renderHomePage },
      { pattern: '/talentos', handler: (outlet) => renderFeatsPage(outlet, []) },
      { pattern: /^\/talentos\/([^/]+)$/, handler: renderFeatsPage },
      { pattern: '/condicoes', handler: (outlet) => renderConditionsPage(outlet, []) },
      { pattern: /^\/condicoes\/([^/]+)$/, handler: renderConditionsPage },
      { pattern: /^\/magias\/([^/]+)$/, handler: renderSpellsPage },
      { pattern: '/magias', handler: renderSpellsPage },
      { pattern: '/monstros', handler: (outlet) => renderMonstersPage(outlet, []) },
      { pattern: /^\/monstros\/([^/]+)$/, handler: renderMonstersPage },
      { pattern: '/equipamentos', handler: (outlet) => renderEquipmentPage(outlet, []) },
      { pattern: /^\/equipamentos\/([^/]+)$/, handler: renderEquipmentPage },
      { pattern: '/racas', handler: (outlet) => renderRacesPage(outlet, []) },
      { pattern: /^\/racas\/([^/]+)$/, handler: renderRacesPage },
      { pattern: /^\/classes\/([^/]+)$/, handler: renderClassPage },
    ],
    renderNotFoundPage
  );

  router.init();
});
