import { getLang } from '../utils/locale.js';

const API_BASE = '/api';
const GRAPHQL_URL = 'https://www.dnd5eapi.co/graphql';

const CACHE_TTL = 3600000;
const MAX_CACHE = 50;

class LRUCache {
  #cache = new Map();
  #maxSize;
  #ttl;

  constructor(maxSize = 50, ttlMs = 3600000) {
    this.#maxSize = maxSize;
    this.#ttl = ttlMs;
  }

  get(key) {
    if (!this.#cache.has(key)) return null;
    const entry = this.#cache.get(key);
    if (Date.now() - entry.timestamp > this.#ttl) {
      this.#cache.delete(key);
      return null;
    }
    this.#cache.delete(key);
    this.#cache.set(key, entry);
    return entry.data;
  }

  set(key, data) {
    if (this.#cache.size >= this.#maxSize) {
      const oldest = this.#cache.keys().next().value;
      if (oldest !== undefined) this.#cache.delete(oldest);
    }
    this.#cache.set(key, { data, timestamp: Date.now() });
  }

  clear() {
    this.#cache.clear();
  }

  get size() {
    return this.#cache.size;
  }
}

const cache = new LRUCache(MAX_CACHE, CACHE_TTL);

function getCached(key) {
  return cache.get(key);
}

function setCache(key, data) {
  cache.set(key, data);
}

async function apiFetch(endpoint, options = {}) {
  const lang = getLang();
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `${API_BASE}${endpoint}${sep}lang=${lang}`;

  const cached = getCached(url);
  if (cached) return cached;

  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...options.headers },
    signal: options.signal,
  });

  if (!res.ok) {
    const err = new Error(`API ${res.status}: ${res.statusText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  setCache(url, data);
  return data;
}

async function graphqlQuery(query, variables = {}) {
  const lang = getLang();
  const cacheKey = `gql:${query}:${JSON.stringify(variables)}:${lang}`;

  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { ...variables, lang },
    }),
  });

  if (!res.ok) {
    const err = new Error(`GraphQL ${res.status}: ${res.statusText}`);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  if (json.errors) {
    const err = new Error(json.errors[0].message);
    err.errors = json.errors;
    throw err;
  }

  setCache(cacheKey, json.data);
  return json.data;
}

/* ============== NORMALIZERS ============== */

export function normalizeMonster(raw) {
  return {
    id: raw.index,
    name: raw.name,
    size: raw.size,
    type: raw.type,
    alignment: raw.alignment,
    armorClass: raw.armor_class?.[0]?.value ?? raw.armor_class,
    hitPoints: raw.hit_points,
    hitDice: raw.hit_dice,
    speed: raw.speed,
    abilities: {
      str: raw.strength, dex: raw.dexterity, con: raw.constitution,
      int: raw.intelligence, wis: raw.wisdom, cha: raw.charisma,
    },
    proficiencies: raw.proficiencies?.map(p => ({
      name: p.proficiency?.name ?? p.name,
      value: p.value,
    })),
    damageVulnerabilities: raw.damage_vulnerabilities ?? [],
    damageResistances: raw.damage_resistances ?? [],
    damageImmunities: raw.damage_immunities ?? [],
    conditionImmunities: (raw.condition_immunities ?? []).map(c => c.name ?? c),
    senses: raw.senses,
    languages: raw.languages,
    challengeRating: raw.challenge_rating,
    xp: raw.xp,
    traits: (raw.special_abilities ?? []).map(a => ({
      name: a.name, description: a.desc,
    })),
    actions: (raw.actions ?? []).map(a => ({
      name: a.name, description: a.desc,
      damage: a.damage?.map(d => ({
        dice: d.damage_dice, damageType: d.damage_type?.name,
      })),
    })),
    legendaryActions: (raw.legendary_actions ?? []).map(a => ({
      name: a.name, description: a.desc,
      damage: a.damage?.map(d => ({
        dice: d.damage_dice, damageType: d.damage_type?.name,
      })),
    })),
    image: raw.image ? `https://www.dnd5eapi.co${raw.image}` : null,
    url: raw.url,
    source: '5e-bits',
  };
}

export function normalizeSpell(raw) {
  return {
    id: raw.index,
    name: raw.name,
    level: raw.level,
    school: raw.school?.name ?? raw.school ?? '',
    castingTime: raw.casting_time ?? raw.castingTime ?? '',
    range: raw.range ?? '',
    duration: raw.duration ?? '',
    components: raw.components ?? [],
    material: raw.material ?? '',
    ritual: raw.ritual ?? false,
    concentration: raw.concentration ?? false,
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

export function normalizeEquipment(raw) {
  return {
    id: raw.index,
    name: raw.name,
    category: raw.equipment_category?.name ?? raw.category ?? '',
    cost: raw.cost ? `${raw.cost.quantity} ${raw.cost.unit}` : null,
    weight: raw.weight ?? null,
    description: Array.isArray(raw.desc) ? raw.desc.join('\n') : (raw.desc ?? ''),
    properties: (raw.properties ?? []).map(p => p.name ?? p),
    damage: raw.damage ? {
      dice: raw.damage.damage_dice,
      type: raw.damage.damage_type?.name,
    } : null,
    range: raw.range ?? null,
    armorClass: raw.armor_class ? {
      base: raw.armor_class.base,
      dexBonus: raw.armor_class.dex_bonus,
      maxBonus: raw.armor_class.max_bonus,
    } : null,
    stealthDisadvantage: raw.stealth_disadvantage ?? false,
    source: '5e-bits',
  };
}

export function normalizeRace(raw) {
  return {
    id: raw.index,
    name: raw.name,
    speed: raw.speed,
    abilityBonuses: (raw.ability_bonuses ?? []).map(ab => ({
      name: ab.ability_score?.name ?? ab.name,
      bonus: ab.bonus,
    })),
    alignment: raw.alignment ?? '',
    age: raw.age ?? '',
    size: raw.size,
    sizeDescription: raw.size_description ?? '',
    languages: (raw.languages ?? []).map(l => l.name ?? l),
    languageDesc: raw.language_desc ?? '',
    traits: (raw.traits ?? []).map(t => t.name ?? t),
    subraces: (raw.subraces ?? []).map(s => s.name ?? s),
    startingProficiencies: (raw.starting_proficiencies ?? []).map(p => p.name ?? p),
    source: '5e-bits',
  };
}

/* ============== REST API METHODS ============== */

export async function fetchResourceList(endpoint, signal) {
  return apiFetch(`/${endpoint}`, { signal });
}

export async function fetchResourceByIndex(endpoint, index, signal) {
  return apiFetch(`/${endpoint}/${index}`, { signal });
}

/* ============== NORMALIZERS (new) ============== */

export function normalizeFeat(raw) {
  return {
    id: raw.index,
    name: raw.name,
    prerequisites: (raw.prerequisites ?? []).map(p => ({
      abilityScore: p.ability_score?.name ?? '',
      minimumScore: p.minimum_score ?? 0,
    })),
    desc: Array.isArray(raw.desc) ? raw.desc.join('\n') : (raw.desc ?? ''),
    source: '5e-bits',
  };
}

export function normalizeCondition(raw) {
  return {
    id: raw.index,
    name: raw.name,
    desc: Array.isArray(raw.desc) ? raw.desc.join('\n') : (raw.desc ?? ''),
    source: '5e-bits',
  };
}

/* Monsters */
export async function fetchMonsters(signal) {
  return apiFetch('/monsters', { signal });
}

export async function fetchMonster(index, signal) {
  const raw = await apiFetch(`/monsters/${index}`, { signal });
  return normalizeMonster(raw);
}

/* Spells */
export async function fetchSpells(signal) {
  const data = await apiFetch('/spells', { signal });
  return data;
}

export async function fetchSpell(index, signal) {
  const raw = await apiFetch(`/spells/${index}`, { signal });
  return normalizeSpell(raw);
}

export async function fetchSpellsByLevel(level, signal) {
  return apiFetch(`/spells?level=${level}`, { signal });
}

/* Equipment */
export async function fetchEquipment(signal) {
  return apiFetch('/equipment', { signal });
}

export async function fetchEquipmentItem(index, signal) {
  const raw = await apiFetch(`/equipment/${index}`, { signal });
  return normalizeEquipment(raw);
}

/* Races */
export async function fetchRaces(signal) {
  return apiFetch('/races', { signal });
}

export async function fetchRace(index, signal) {
  const raw = await apiFetch(`/races/${index}`, { signal });
  return normalizeRace(raw);
}

/* Classes */
export async function fetchClasses(signal) {
  return apiFetch('/classes', { signal });
}

export async function fetchClass(index, signal) {
  return apiFetch(`/classes/${index}`, { signal });
}

export async function fetchClassSpellcasting(index, signal) {
  return apiFetch(`/classes/${index}/spellcasting`, { signal });
}

export async function fetchClassLevels(index, signal) {
  return apiFetch(`/classes/${index}/levels`, { signal });
}

export async function fetchClassFeatures(index, signal) {
  return apiFetch(`/classes/${index}/features`, { signal });
}

export async function fetchClassSubclasses(index, signal) {
  return apiFetch(`/classes/${index}/subclasses`, { signal });
}

/* Feats */
export async function fetchFeats(signal) {
  return apiFetch('/feats', { signal });
}

export async function fetchFeat(index, signal) {
  const raw = await apiFetch(`/feats/${index}`, { signal });
  return normalizeFeat(raw);
}

/* Conditions */
export async function fetchConditions(signal) {
  return apiFetch('/conditions', { signal });
}

export async function fetchCondition(index, signal) {
  const raw = await apiFetch(`/conditions/${index}`, { signal });
  return normalizeCondition(raw);
}

/* ============== GRAPHQL METHODS ============== */

const MONSTER_DETAIL_QUERY = `
  query($index: String!, $lang: String) {
    monster(index: $index, lang: $lang) {
      index name size type alignment
      armor_class { value }
      hit_points hit_dice
      speed
      strength dexterity constitution
      intelligence wisdom charisma
      proficiencies { proficiency { name } value }
      damage_vulnerabilities
      damage_resistances
      damage_immunities
      condition_immunities { name }
      senses languages
      challenge_rating xp
      special_abilities { name desc }
      actions { name desc damage { damage_dice damage_type { name } } }
      legendary_actions { name desc damage { damage_dice damage_type { name } } }
      image
    }
  }
`;

export async function fetchMonsterDetailGQL(index) {
  const data = await graphqlQuery(MONSTER_DETAIL_QUERY, { index });
  return normalizeMonster(data.monster);
}

const SPELL_DETAIL_QUERY = `
  query($index: String!, $lang: String) {
    spell(index: $index, lang: $lang) {
      index name level
      school { name }
      casting_time range duration
      components material ritual concentration
      desc higher_level
      classes { name }
      subclasses { name }
    }
  }
`;

export async function fetchSpellDetailGQL(index) {
  const data = await graphqlQuery(SPELL_DETAIL_QUERY, { index });
  return normalizeSpell(data.spell);
}

const EQUIPMENT_DETAIL_QUERY = `
  query($index: String!, $lang: String) {
    equipment(index: $index, lang: $lang) {
      index name
      equipment_category { name }
      cost { quantity unit }
      weight desc
      properties { name }
      damage { damage_dice damage_type { name } }
      range
      armor_class { base dex_bonus max_bonus }
      stealth_disadvantage
    }
  }
`;

export async function fetchEquipmentDetailGQL(index) {
  const data = await graphqlQuery(EQUIPMENT_DETAIL_QUERY, { index });
  return normalizeEquipment(data.equipment);
}

export function clearApiCache() {
  cache.clear();
}

export async function fetchBatch(items, fetchFn, limit = 10) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchResults = await Promise.allSettled(
      batch.map(item => fetchFn(item))
    );
    results.push(...batchResults.map((r, j) => ({
      item: batch[j],
      value: r.status === 'fulfilled' ? r.value : null,
      error: r.status === 'rejected' ? r.reason : null,
    })));
  }
  return results;
}
