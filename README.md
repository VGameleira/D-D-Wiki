# 🏰 Torre do Sábio

**Enciclopédia interativa de Dungeons & Dragons 5ª edição em português.**

[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite)](https://vitejs.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Components](https://img.shields.io/badge/Web%20Components-v1-FF9800)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/VGameleira/dnd-wiki/actions)

---

## ✨ Funcionalidades

- **14 classes** completas com tabelas de progressão nível 1–20, descrição de habilidades e subclasses
- **+570 magias** organizadas por nível e escola, com filtros interativos
- **Dark mode** nativo que respeita a preferência do sistema
- **Design responsivo** — mobile, tablet e desktop
- **Roteador SPA** — navegação fluida sem recarregar a página
- **Web Components** — componentes reutilizáveis e encapsulados
- **Zero dependências de framework** — JavaScript vanilla moderno

---

## 🚀 Começando

```bash
# Clone o repositório
git clone https://github.com/VGameleira/dnd-wiki.git

# Entre no diretório
cd dnd-wiki

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:5501](http://localhost:5501) no navegador.

---

## 📦 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento com HMR |
| `npm run build` | Gera build de produção em `dist/` |
| `npm run preview` | Visualiza o build de produção |
| `npm test` | Executa os testes unitários |
| `npm run scrape` | Extrai dados atualizados do dnd5e.wikidot.com |
| `npm run validate` | Valida a integridade dos dados extraídos |

---

## 🧱 Arquitetura

```
src/
├── components/     # Web Components (Custom Elements)
│   ├── dnd-header.js
│   ├── dnd-navbar.js
│   ├── dnd-footer.js
│   ├── dnd-class-card.js
│   ├── dnd-spell-card.js
│   ├── dnd-table.js
│   └── dnd-search.js
├── data/           # Dados estruturados (JSON)
│   ├── classes.json
│   └── spells.json
├── pages/          # Páginas renderizadas pelo router
│   ├── home.js
│   ├── class-page.js
│   ├── spells-page.js
│   └── not-found.js
├── styles/         # CSS modular
│   └── base.css
├── utils/          # Utilitários
│   ├── router.js
│   ├── fetch-data.js
│   ├── theme.js
│   ├── dice.js
│   ├── formatters.js
│   └── search.js
└── main.js         # Entry point
```

**Princípios aplicados:**

- **Separação de interesses**: dados, lógica e apresentação em camadas distintas
- **Componentização**: UI composta por Web Components reutilizáveis
- **Data-driven**: conteúdo gerenciado em JSON, renderizado por componentes
- **Roteamento SPA**: navegação client-side via History API
- **Testabilidade**: funções puras em `/utils` testadas com Vitest

---

## 🧪 Testes

```bash
npm test            # Executa todos os testes
npm run test:watch  # Modo watch
```

Cobertura atual:

- **Utils**: `dice.js`, `formatters.js`, `search.js` — 23 testes
- **Dados**: validação de schemas com `npm run validate`

---

## 📊 Pipeline de Dados

O conteúdo é extraído automaticamente de [dnd5e.wikidot.com](https://dnd5e.wikidot.com) via scraper:

```bash
npm run scrape      # Extrai classes + magias
npm run validate    # Valida dados extraídos
```

O scraper (`scripts/scraper.mjs`) parseia o HTML das páginas oficiais e gera JSON estruturado em `src/data/`.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o guia de contribuição em [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork o projeto
2. Crie sua branch: `git checkout -b feat/nova-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feat/nova-feature`
5. Abra um Pull Request

---

## 📜 Licença

MIT © [Vinícius dos Santos Gameleira](https://github.com/VGameleira)

---

## 🙏 Agradecimentos

- Conteúdo extraído de [dnd5e.wikidot.com](https://dnd5e.wikidot.com) (comunidade D&D 5e)
- Inspiração no [D&D 5e Wiki](https://dnd5e.wikidot.com) original
- Fontes: [Cinzel](https://fonts.google.com/specimen/Cinzel) e [Merriweather](https://fonts.google.com/specimen/Merriweather) via Google Fonts
