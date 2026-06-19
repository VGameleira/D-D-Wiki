# 🏗️ Arquitetura da Torre do Sábio

## Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Build | Vite 6 | Dev server instantâneo, HMR, build otimizado, zero config |
| UI | Web Components v1 | Componentização nativa sem framework |
| Estilos | CSS Custom Properties | Tema dinâmico claro/escuro, design system consistente |
| Dados | JSON estático | Simples, versionável, cacheável |
| Testes | Vitest 3 | Testes unitários rápidos e compatíveis com ES modules |
| CI/CD | GitHub Actions | Qualidade automatizada + deploy para Pages |

## Princípios Arquiteturais

### 1. Separação de Interesses

```
src/
  data/     → O que o site sabe (dados puros)
  utils/    → Como o site funciona (lógica pura)
  pages/    → O que o site mostra (orquestração)
  components/ → Como o site se apresenta (UI reutilizável)
```

### 2. Data-Driven

Todo o conteúdo é gerenciado como dados JSON em `src/data/`. Os componentes consomem esses dados via `loadData()` e renderizam de acordo. Para adicionar conteúdo novo:

1. Extraia os dados para JSON (scraper ou manual)
2. Crie um Web Component para exibição
3. Crie uma página que carrega os dados e instancia os componentes

### 3. Componentização via Web Components

Cada elemento da UI é um Custom Element registrado com `customElements.define()`:

- **Encapsulamento**: Shadow DOM para estilos isolados
- **Configurável**: Atributos HTML para dados de entrada
- **Componível**: Slots para composição de layout
- **Lifecycle**: `connectedCallback`, `attributeChangedCallback` para reatividade

### 4. Roteamento SPA

O `DndRouter` usa History API para navegação sem recarregar:

```
URL → pattern matching → handler → renderiza em #app-content
```

As páginas são funções assíncronas que recebem o outlet DOM e são responsáveis por montar o conteúdo.

### 5. Testabilidade

Funções em `src/utils/` são puras (sem DOM, sem I/O), facilitando testes unitários.

## Fluxo de Dados

```
dnd5e.wikidot.com
      ↓ (scraper)
src/data/*.json
      ↓ (fetch API)
loadData(endpoint)
      ↓
Pages (orquestração)
      ↓
Web Components (renderização)
      ↓
Shadow DOM (exibição)
```

## Performance

- Build de produção: ~35 KB JS + ~2 KB CSS (gzip: ~9 KB)
- Dados carregados sob demanda via fetch
- Lazy loading de imagens
- Zero dependências runtime além do Vite

## Manutenção

### Adicionar uma nova classe

1. O scraper já cobre as 14 classes principais. Para adicionar uma:
   - Adicione o slug em `CLASS_SLUGS` e o nome em `CLASS_NAMES_PT` no scraper
   - Execute `npm run scrape`

### Adicionar um novo tipo de conteúdo

1. Crie o scraper para extrair os dados
2. Salve como JSON em `src/data/`
3. Crie um Web Component para exibição
4. Crie uma página no router
5. Adicione testes

### Modificar o tema

As cores estão centralizadas em `src/styles/base.css` nas variáveis `:root` e `[data-theme='dark']`.
