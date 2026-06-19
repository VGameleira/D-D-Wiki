/**
 * Validador de dados da Torre do Sábio.
 *
 * Verifica a integridade e estrutura de todos os arquivos
 * JSON em src/data/.
 *
 * Uso: node scripts/validate-data.mjs
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`  ✗ ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  ⚠ ${msg}`);
  warnings++;
}

function validateClasses(data) {
  if (!Array.isArray(data)) return error('classes.json deve ser um array');

  for (const cls of data) {
    if (!cls.slug) error(`Classe sem slug: ${JSON.stringify(cls.name)}`);
    if (!cls.name) error(`Classe sem nome: ${cls.slug || '???'}`);
    if (!cls.description) warn(`Classe sem descrição: ${cls.name}`);

    if (cls.progressionTable) {
      if (!Array.isArray(cls.progressionTable.columns)) error(`ProgressionTable.columns não é array: ${cls.name}`);
      if (!Array.isArray(cls.progressionTable.rows)) error(`ProgressionTable.rows não é array: ${cls.name}`);
    }

    if (cls.features && Array.isArray(cls.features)) {
      for (const feat of cls.features) {
        if (!feat.name) warn(`Feature sem nome em ${cls.name}`);
      }
    }

    if (cls.subclasses && !Array.isArray(cls.subclasses)) {
      error(`subclasses não é array em ${cls.name}`);
    }
  }

  const slugs = data.map(c => c.slug);
  const uniqueSlugs = new Set(slugs);
  if (uniqueSlugs.size !== slugs.length) {
    error('Slugs duplicados em classes.json');
  }

  console.log(`  ${data.length} classes válidas`);
}

function validateSpells(data) {
  if (!data) return; /* opcional por enquanto */
}

/* ============================================================ */

console.log('\n🔍 Validando dados em', DATA_DIR, '\n');

if (!existsSync(DATA_DIR)) {
  console.error('Diretório de dados não encontrado:', DATA_DIR);
  process.exit(1);
}

const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

if (files.length === 0) {
  console.log('  Nenhum arquivo JSON encontrado. Execute o scraper primeiro.');
  process.exit(0);
}

for (const file of files) {
  console.log(`📄 ${file}:`);

  let data;
  try {
    const content = readFileSync(join(DATA_DIR, file), 'utf-8');
    data = JSON.parse(content);
  } catch (err) {
    error(`Erro ao parsear ${file}: ${err.message}`);
    continue;
  }

  if (file === 'classes.json') validateClasses(data);
  else if (file === 'spells.json') validateSpells(data);
  else console.log(`  (sem validação específica para ${file})`);
}

console.log(`\n${errors > 0 ? '❌' : '✅'} ${errors} erros, ${warnings} avisos\n`);
process.exit(errors > 0 ? 1 : 0);
