# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com a **Torre do Sábio**!

## Como contribuir

### Reportando bugs

- Verifique se o bug já não foi reportado nas [issues](https://github.com/VGameleira/dnd-wiki/issues)
- Abra uma nova issue com:
  - Descrição clara do problema
  - Passos para reproduzir
  - Comportamento esperado vs. atual
  - Screenshots (se aplicável)

### Sugerindo melhorias

- Abra uma issue com a tag `enhancement`
- Descreva a melhoria e o motivo

### Pull Requests

1. Fork o repositório
2. Crie uma branch descritiva:
   - `feat/nome-da-feature` para novas funcionalidades
   - `fix/nome-do-bug` para correções
   - `docs/melhoria` para documentação
3. Siga os padrões de código existentes
4. Escreva testes para novas funcionalidades
5. Verifique se os testes passam: `npm test`
6. Verifique se o build passa: `npm run build`
7. Abra o Pull Request

## Padrões de código

### JavaScript

- ES Modules (`import`/`export`)
- Web Components para componentes de UI
- Funções puras em `/utils`
- Nomes descritivos em português ou inglês

### Web Components

- Prefixo `dnd-` para todos os elementos customizados
- Shadow DOM para encapsulamento de estilo
- Atributos para configuração via HTML
- Eventos customizados para comunicação

### CSS

- Variáveis CSS para tema (claro/escuro)
- Nomes descritivos em inglês (kebab-case)
- Design responsivo com media queries

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug no componente X
docs: atualiza README
test: adiciona testes para utilitário Y
refactor: reorganiza módulo Z
```

## Estrutura do projeto

```
src/
  components/   # Web Components
  data/         # Dados em JSON
  pages/        # Páginas do router
  styles/       # CSS
  utils/        # Utilitários
scripts/        # Scripts de ferramenta (scraper, validação)
tests/          # Testes unitários
```

Dúvidas? Abra uma issue ou entre em contato pelo [GitHub](https://github.com/VGameleira).
