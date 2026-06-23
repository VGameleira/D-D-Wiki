/**
 * Script para baixar TODOS os detalhes das magias da API 5e-bits
 * e salvar em src/data/spells.json com campos completos.
 *
 * Uso: node scripts/download-spells.mjs
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');
const API_BASE = 'https://www.dnd5eapi.co/api/2014';
const CONCURRENCY = 10;

function normalizeSpell(raw) {
  return {
    slug: raw.index,
    name: raw.name,
    level: raw.level,
    school: raw.school?.name ?? '',
    castingTime: raw.casting_time ?? '',
    range: raw.range ?? '',
    components: raw.components ?? [],
    material: raw.material ?? '',
    duration: raw.duration ?? '',
    concentration: raw.ritual === undefined ? false : (raw.concentration ?? false),
    ritual: raw.ritual ?? false,
    attackType: raw.attack_type ?? null,
    description: Array.isArray(raw.desc) ? raw.desc.join('\n') : (raw.desc ?? ''),
    higherLevel: Array.isArray(raw.higher_level) ? raw.higher_level.join('\n') : (raw.higher_level ?? ''),
    damage: raw.damage ? {
      damageType: raw.damage.damage_type?.name ?? null,
      damageAtSlotLevel: raw.damage.damage_at_slot_level ?? null,
      damageAtCharacterLevel: raw.damage.damage_at_character_level ?? null,
    } : null,
    dc: raw.dc ? {
      dcType: raw.dc.dc_type?.name ?? null,
      dcSuccess: raw.dc.dc_success ?? null,
      desc: raw.dc.desc ?? null,
    } : null,
    areaOfEffect: raw.area_of_effect ? {
      size: raw.area_of_effect.size,
      type: raw.area_of_effect.type,
    } : null,
    healAtSlotLevel: raw.heal_at_slot_level ?? null,
    classes: (raw.classes ?? []).map(c => c.name ?? c),
    subclasses: (raw.subclasses ?? []).map(c => c.name ?? c),
    source: '5e-bits',
  };
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  console.log('🔮 Buscando lista de magias...');
  const listRes = await fetch(`${API_BASE}/spells`);
  if (!listRes.ok) throw new Error(`HTTP ${listRes.status} na lista`);
  const listData = await listRes.json();
  const allSlugs = listData.results.map(r => r.index);
  console.log(`   ${allSlugs.length} magias encontradas\n`);

  const results = [];
  let completed = 0;
  const total = allSlugs.length;
  const startTime = Date.now();

  for (let i = 0; i < total; i += CONCURRENCY) {
    const batch = allSlugs.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(async (slug) => {
        const res = await fetch(`${API_BASE}/spells/${slug}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${slug}`);
        const raw = await res.json();
        return normalizeSpell(raw);
      })
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') {
        results.push(r.value);
      } else {
        console.error(`  ✗ Erro: ${r.reason?.message ?? r.reason}`);
      }
    }

    completed += batch.length;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\r   ${completed}/${total} (${elapsed}s)`);
  }

  console.log(`\n\n📝 Salvando ${results.length} magias...`);
  writeFileSync(join(DATA_DIR, 'spells.json'), JSON.stringify(results, null, 2), 'utf-8');

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Concluído em ${totalTime}s — ${results.length} magias salvas em src/data/spells.json`);
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
