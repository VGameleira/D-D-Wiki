/**
 * Scraper da Torre do Sábio
 *
 * Extrai conteúdo estruturado do dnd5e.wikidot.com.
 *
 * Uso:
 *   node scripts/scraper.mjs              # extrai tudo
 *   node scripts/scraper.mjs --classes    # só classes
 *   node scripts/scraper.mjs --local <f>  # parse arquivo local
 */

import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');
const BASE_URL = 'https://dnd5e.wikidot.com';

/* ============================================================
 * Utilitários
 * ============================================================ */

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function writeJSON(filename, data) {
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  ✓ ${filename} (${data.length} itens)`);
}

const CLASS_NAMES_PT = {
  artificer: 'Artífice',
  barbarian: 'Bárbaro',
  bard: 'Bardo',
  cleric: 'Clérigo',
  druid: 'Druida',
  fighter: 'Guerreiro',
  monk: 'Monge',
  paladin: 'Paladino',
  ranger: 'Patrulheiro',
  rogue: 'Ladino',
  sorcerer: 'Feiticeiro',
  warlock: 'Bruxo',
  wizard: 'Mago',
  'blood-hunter': 'Caçador de Sangue',
};

/* ============================================================
 * Parsing de tabela (formato dnd5e.wikidot.com)
 *
 * As tabelas usam <th> dentro de <tbody>, com a primeira
 * linha sendo um cabeçalho mesclado (colspan) e a segunda
 * sendo os nomes reais das colunas.
 * ============================================================ */

function parseWikiTable($, table) {
  if (!table || !table.length) return null;

  const rows = [];
  table.find('tbody tr').each((_, tr) => {
    const cells = [];
    $(tr).find('th, td').each((_, cell) => {
      cells.push(cleanText($(cell).text()));
    });
    if (cells.length > 0) rows.push(cells);
  });

  if (rows.length < 2) return null;

  /* Detecta linha de cabeçalho:
     - Se a primeira linha tem menos células que a segunda, é um título mesclado (colspan)
     - Ou se a primeira linha contém "Level" */
  let headerRowIdx = 0;

  if (rows.length >= 2) {
    const firstLen = rows[0].length;
    const secondLen = rows[1].length;

    /* Se a primeira linha tem colspan (menos células) ou a segunda tem "Level" */
    if (firstLen < secondLen || rows[1].some(c => /^Level$/i.test(c.trim()))) {
      headerRowIdx = 1;
    }
  }

  const headers = rows[headerRowIdx];
  rows.splice(0, headerRowIdx + 1); /* Remove cabeçalho(s) */

  return {
    columns: headers.map(h => cleanText(h)),
    rows: rows.map(row => row.map(c => cleanText(c))),
  };
}

/* ============================================================
 * Parsing de features
 *
 * Dentro de <div class="feature">, as features são <h3>
 * e os detalhes são <p> e <ul> que seguem.
 * ============================================================ */

function parseFeatures($, container) {
  const features = [];
  let current = null;

  container.find('h1, h3, h4, h5, p, ul').each((_, el) => {
    const tag = el.tagName.toLowerCase();

    if (tag === 'h1' && $(el).text().trim() === 'Class Features') {
      return; /* Ignora título principal */
    }

    if (['h3', 'h4', 'h5'].includes(tag)) {
      if (current && current.description) features.push(current);

      const text = cleanText($(el).text());
      current = {
        name: text,
        level: null,
        description: '',
      };
    } else if (current && (tag === 'p' || tag === 'ul')) {
      const text = tag === 'ul'
        ? $(el).find('li').map((_, li) => `• ${cleanText($(li).text())}`).get().join('\n')
        : cleanText($(el).text());

      current.description += (current.description ? '\n\n' : '') + text;
    }
  });

  if (current && current.description) features.push(current);
  return features;
}

/* ============================================================
 * Parsing de subclasses
 * ============================================================ */

function parseSubclasses($, table) {
  const subclasses = [];

  table.find('tbody tr').each((_, tr) => {
    const cells = $(tr).find('td');
    if (cells.length >= 2) {
      const name = cleanText($(cells[0]).text());
      /* Remove link do nome */
      const link = $(cells[0]).find('a');
      const scName = link.length ? cleanText(link.text()) : name;
      const source = cleanText($(cells[cells.length - 1]).text());
      if (scName && scName !== 'Specialty' && scName !== '-') {
        subclasses.push({ name: scName, source });
      }
    }
  });

  return subclasses;
}

/* ============================================================
 * Classes
 * ============================================================ */

const CLASS_SLUGS = [
  'artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter',
  'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard',
  'blood-hunter',
];

async function fetchPage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return await res.text();
}

function parseClassPage(html, slug) {
  const $ = cheerio.load(html);
  const name = CLASS_NAMES_PT[slug] || slug;

  /* Descrição: primeiro <p> em #page-content */
  const description = cleanText($('#page-content > p').first().text());
  const shortDescription = description.split('.')[0] + '.';

  /* Tabela de progressão */
  const tables = $('#page-content table.wiki-content-table');
  const progressionTable = tables.length > 0 ? parseWikiTable($, $(tables[0])) : null;

  /* Features: dentro de <div class="feature"> */
  const featureDiv = $('#page-content .feature');
  const features = featureDiv.length > 0
    ? parseFeatures($, featureDiv)
    : parseFeatures($, $('#page-content'));

  /* Subclasses: todas as tabelas após a primeira */
  let subclasses = [];
  for (let i = 1; i < tables.length; i++) {
    const parsed = parseSubclasses($, $(tables[i]));
    if (parsed.length > 0) subclasses = subclasses.concat(parsed);
  }

  /* Fallback: se não achou, procura tabelas soltas com "Specialty" */
  if (subclasses.length === 0) {
    $('table.wiki-content-table').each((_, tbl) => {
      const text = $(tbl).text();
      if (text.includes('Specialty') || text.includes('Specialization')) {
        const parsed = parseSubclasses($, $(tbl));
        if (parsed.length > 0) subclasses = parsed;
      }
    });
  }

  return {
    slug,
    name,
    description,
    shortDescription,
    image: `/img/classes/${slug}.png`,
    progressionTable,
    features: features.filter(f => f.name),
    subclasses,
  };
}

async function scrapeClasses() {
  console.log('\n📚 Extraindo classes...');
  const classes = [];

  for (const slug of CLASS_SLUGS) {
    try {
      process.stdout.write(`  ${slug}... `);
      const html = await fetchPage(`${BASE_URL}/${slug}`);
      const cls = parseClassPage(html, slug);
      classes.push(cls);
      console.log(`✓ (${cls.features.length} features, ${cls.subclasses.length} subs)`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  writeJSON('classes.json', classes);
  return classes;
}

/* ============================================================
 * Scraper local (fallback)
 * ============================================================ */

function scrapeLocalClasses(filepath) {
  console.log(`\n📚 Extraindo classes de ${filepath}...`);
  const raw = readFileSync(filepath);
  let html;
  if (raw.length >= 2 && raw[0] === 0xFF && raw[1] === 0xFE) {
    html = new TextDecoder('utf-16le').decode(raw);
    writeFileSync(filepath + '.utf8', html, 'utf-8');
  } else if (raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF) {
    html = raw.toString('utf-8').slice(1); /* BOM UTF-8 */
  } else {
    html = raw.toString('utf-8');
  }

  const $ = cheerio.load(html);
  const classes = [];

  $('section').each((_, section) => {
    const $section = $(section);
    const id = $section.attr('id');
    if (!id || id === 'app-content') return;

    const name = cleanText($section.find('> h1, > header h1').first().text()) || id;
    const description = cleanText($section.find('> p').first().text());
    const shortDescription = description.split('.')[0] + '.';

    const table = parseWikiTable($, $section.find('table').first());
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    classes.push({
      slug,
      name,
      description,
      shortDescription,
      image: `/img/${slug}.png`,
      progressionTable: table,
      features: [],
      subclasses: [],
    });
  });

  writeJSON('classes.json', classes);
  return classes;
}

/* ============================================================
 * Main
 * ============================================================ */

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  Uso: node scripts/scraper.mjs [opções]

  --classes           Extrair apenas classes
  --local <arquivo>   Parsear HTML local (fallback)
  --help              Mostrar ajuda
  `);
  process.exit(0);
}

ensureDataDir();

if (args.includes('--local')) {
  const idx = args.indexOf('--local');
  scrapeLocalClasses(args[idx + 1]);
} else if (args.includes('--classes')) {
  await scrapeClasses();
} else {
  await scrapeClasses();
}

console.log('\n✅ Extração concluída!\n');
