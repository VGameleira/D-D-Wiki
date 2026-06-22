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

function checkType(value, type, label) {
  if (type === 'array') {
    if (!Array.isArray(value)) error(`${label} deve ser array`);
    return Array.isArray(value);
  }
  if (typeof value !== type) {
    error(`${label} deve ser ${type}, recebeu ${typeof value}`);
    return false;
  }
  return true;
}

function validateClasses(data) {
  if (!checkType(data, 'array', 'classes.json')) return;

  for (const cls of data) {
    if (!cls.slug) { error(`Classe sem slug: ${JSON.stringify(cls.name)}`); continue; }
    if (!cls.name) { error(`Classe sem nome: ${cls.slug}`); continue; }

    if (!cls.description) warn(`Classe sem descrição: ${cls.name}`);

    if (cls.progressionTable) {
      checkType(cls.progressionTable.columns, 'array', `progressionTable.columns (${cls.name})`);
      checkType(cls.progressionTable.rows, 'array', `progressionTable.rows (${cls.name})`);

      if (Array.isArray(cls.progressionTable.rows)) {
        cls.progressionTable.rows.forEach((row, i) => {
          if (!Array.isArray(row)) {
            error(`progressionTable.rows[${i}] não é array (${cls.name})`);
          }
        });
      }
    }

    if (cls.features && Array.isArray(cls.features)) {
      for (const feat of cls.features) {
        if (!feat.name) warn(`Feature sem nome em ${cls.name}`);
        if (feat.description && typeof feat.description !== 'string') {
          warn(`Feature "${feat.name}" description não é string (${cls.name})`);
        }
      }
    }

    if (cls.subclasses !== undefined) {
      checkType(cls.subclasses, 'array', `subclasses (${cls.name})`);
      if (Array.isArray(cls.subclasses)) {
        cls.subclasses.forEach((sc, i) => {
          if (!sc.name) error(`subclasses[${i}] sem name (${cls.name})`);
          if (typeof sc.name === 'string' && /^\d+(st|nd|rd|th)?$/.test(sc.name.trim())) {
            error(`subclasses[${i}] name parece corrompido: "${sc.name}" (${cls.name})`);
          }
        });
      }
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
  if (!checkType(data, 'array', 'spells.json')) return;

  for (const spell of data) {
    if (!spell.slug) { warn(`Magia sem slug: ${spell.name || '???'}`); continue; }
    if (spell.level !== undefined && (typeof spell.level !== 'number' || spell.level < 0 || spell.level > 9)) {
      warn(`Magia "${spell.slug}" tem level inválido: ${spell.level}`);
    }
  }

  const slugs = data.map(s => s.slug);
  const uniqueSlugs = new Set(slugs);
  if (uniqueSlugs.size !== slugs.length) {
    error('Slugs duplicados em spells.json');
  }

  console.log(`  ${data.length} magias válidas`);
}

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
