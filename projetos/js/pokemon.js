import {
  fetchAbility,
  fetchEvolutionChain,
  fetchGeneration,
  fetchMove,
  fetchPokemon,
  fetchPokemonList,
  fetchSpecies,
} from './api.js';

const GENERATION_REGION = {
  'generation-i': { label: 'Geração I', region: 'Kanto', roman: 'I' },
  'generation-ii': { label: 'Geração II', region: 'Johto', roman: 'II' },
  'generation-iii': { label: 'Geração III', region: 'Hoenn', roman: 'III' },
  'generation-iv': { label: 'Geração IV', region: 'Sinnoh', roman: 'IV' },
  'generation-v': { label: 'Geração V', region: 'Unova', roman: 'V' },
  'generation-vi': { label: 'Geração VI', region: 'Kalos', roman: 'VI' },
  'generation-vii': { label: 'Geração VII', region: 'Alola', roman: 'VII' },
  'generation-viii': { label: 'Geração VIII', region: 'Galar', roman: 'VIII' },
  'generation-ix': { label: 'Geração IX', region: 'Paldea', roman: 'IX' },
};

const TYPE_COLORS = {
  normal: '#9fa19f', fire: '#e62829', water: '#2980ef', electric: '#fac000', grass: '#3fa129',
  ice: '#3dcef3', fighting: '#ff8000', poison: '#9141cb', ground: '#915121', flying: '#81b9ef',
  psychic: '#ef4179', bug: '#91a119', rock: '#afa981', ghost: '#704170', dragon: '#5060e1',
  dark: '#624d4e', steel: '#60a1b8', fairy: '#ef70ef', stellar: '#40b5a5', unknown: '#6f7982',
};

const readLocalizedEntry = (entries = [], field = 'name') => {
  const pt = entries.find((entry) => entry.language?.name === 'pt-BR' || entry.language?.name === 'pt');
  if (pt?.[field]) return pt[field];

  const en = entries.find((entry) => entry.language?.name === 'en');
  return en?.[field] ?? null;
};

const sanitize = (value = '') => value.replace(/\f/g, ' ').replace(/-/g, ' ').trim();

const formatStat = (name) => {
  const labels = {
    hp: 'HP', attack: 'Ataque', defense: 'Defesa', 'special-attack': 'Ataque Esp.', 'special-defense': 'Defesa Esp.', speed: 'Velocidade',
  };
  return labels[name] ?? sanitize(name);
};

const getArtwork = (pokemon, isShiny) => {
  const artworks = pokemon.sprites.other?.['official-artwork'];

  const preferred = isShiny ? artworks?.front_shiny : artworks?.front_default;
  if (preferred) return preferred;

  const fallback = isShiny
    ? pokemon.sprites.other?.home?.front_shiny || pokemon.sprites.front_shiny
    : artworks?.front_default || pokemon.sprites.other?.home?.front_default || pokemon.sprites.front_default;

  return fallback ?? null;
};

const getSprite = (pokemon, isShiny) => {
  if (isShiny && pokemon.sprites.front_shiny) return pokemon.sprites.front_shiny;
  return pokemon.sprites.front_default || pokemon.sprites.other?.showdown?.front_default || null;
};

const parseEvolutionNodes = (node, chain = []) => {
  chain.push({
    name: node.species.name,
    trigger: node.evolution_details[0]?.trigger?.name ?? 'base',
    minLevel: node.evolution_details[0]?.min_level ?? null,
    item: node.evolution_details[0]?.item?.name ?? null,
    condition: node.evolution_details[0]?.known_move_type?.name
      || node.evolution_details[0]?.time_of_day
      || node.evolution_details[0]?.min_happiness
      || null,
  });

  node.evolves_to.forEach((next) => parseEvolutionNodes(next, chain));
  return chain;
};

const transformPokemonData = async (pokemon, species, generationData, debutData, isShiny = false) => {
  const generationInfo = GENERATION_REGION[species.generation.name] ?? {
    label: sanitize(species.generation.name),
    region: 'Desconhecida',
    roman: '?',
  };

  const entries = species.flavor_text_entries.filter((entry) => ['pt-BR', 'pt', 'en'].includes(entry.language.name));
  const flavor = sanitize(readLocalizedEntry(entries, 'flavor_text') ?? 'Informação indisponível.');

  const abilities = pokemon.abilities.map((ability) => ({
    name: sanitize(ability.ability.name),
    hidden: ability.is_hidden,
    slot: ability.slot,
    key: ability.ability.name,
  }));

  const stats = pokemon.stats.map(({ base_stat: value, stat }) => ({
    name: formatStat(stat.name),
    value,
    rawName: stat.name,
  }));

  const bst = stats.reduce((sum, stat) => sum + stat.value, 0);
  const topStat = [...stats].sort((a, b) => b.value - a.value)[0];

  const forms = pokemon.forms.map((form) => ({ name: sanitize(form.name), key: form.name }));
  const games = pokemon.game_indices.map((item) => sanitize(item.version.name));

  const generationGames = generationData?.version_groups?.map((group) => sanitize(group.name)) ?? [];

  return {
    id: pokemon.id,
    name: sanitize(pokemon.name),
    namePt: readLocalizedEntry(species.names) ?? sanitize(pokemon.name),
    category: sanitize(readLocalizedEntry(species.genera, 'genus') ?? 'Informação não cadastrada'),
    pokedexEntry: flavor,
    types: pokemon.types.map(({ type }) => sanitize(type.name)),
    generationLabel: generationInfo.label,
    generationRoman: generationInfo.roman,
    region: generationInfo.region,
    generationKey: species.generation.name,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    height: (pokemon.height / 10).toLocaleString('pt-BR'),
    weight: (pokemon.weight / 10).toLocaleString('pt-BR'),
    baseExperience: pokemon.base_experience ?? null,
    captureRate: species.capture_rate ?? null,
    growthRate: sanitize(species.growth_rate?.name ?? 'desconhecido'),
    habitat: sanitize(species.habitat?.name ?? 'desconhecido'),
    hatchCounter: species.hatch_counter ?? null,
    eggGroups: species.egg_groups.map((group) => sanitize(group.name)),
    genderRate: species.gender_rate,
    abilities,
    stats,
    bst,
    topStat,
    forms,
    moves: pokemon.moves.map((move) => ({
      name: sanitize(move.move.name),
      key: move.move.name,
      methods: move.version_group_details.map((detail) => sanitize(detail.move_learn_method.name)),
      level: move.version_group_details[0]?.level_learned_at ?? null,
    })),
    games,
    generationGames,
    debut: debutData?.[String(pokemon.id)] ?? null,
    artwork: getArtwork(pokemon, isShiny),
    sprite: getSprite(pokemon, isShiny),
    cry: pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null,
    color: species.color?.name ?? 'unknown',
    evolutionChainUrl: species.evolution_chain?.url ?? null,
    shape: sanitize(species.shape?.name ?? 'desconhecido'),
    formsSwitchable: forms.length > 1,
  };
};

const fetchCompletePokemon = async ({ query, isShiny, debutData, signalSearch }) => {
  const pokemon = await fetchPokemon(query, { useAbort: signalSearch });
  const species = await fetchSpecies(pokemon.id);
  const generationData = await fetchGeneration(species.generation.url);

  return transformPokemonData(pokemon, species, generationData, debutData, isShiny);
};

const loadEvolutionChain = async (evolutionChainUrl) => {
  if (!evolutionChainUrl) return [];
  const chain = await fetchEvolutionChain(evolutionChainUrl);
  return parseEvolutionNodes(chain.chain, []);
};

const loadAbilityDetails = async (abilityKey) => {
  const ability = await fetchAbility(abilityKey);
  return {
    effect: sanitize(readLocalizedEntry(ability.effect_entries, 'short_effect') ?? 'Sem descrição cadastrada.'),
  };
};

const loadMoveDetails = async (moveKey) => {
  const move = await fetchMove(moveKey);
  return {
    name: sanitize(move.name),
    power: move.power ?? '-',
    accuracy: move.accuracy ?? '-',
    pp: move.pp ?? '-',
    damageClass: sanitize(move.damage_class?.name ?? 'status'),
    type: sanitize(move.type?.name ?? 'unknown'),
    effect: sanitize(readLocalizedEntry(move.effect_entries, 'short_effect') ?? 'Sem descrição cadastrada.'),
  };
};

const buildTypeChips = (types) => types.map((type) => ({ label: type, color: TYPE_COLORS[type] ?? TYPE_COLORS.unknown }));

const getDeterministicPokemonOfDay = async () => {
  const today = new Date();
  const seed = Number(`${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`);
  const limitResponse = await fetchPokemonList(0, 1);
  const max = limitResponse.count;
  const id = (seed % max) + 1;
  return id;
};

const getGenerationRange = (generationKey) => {
  const ranges = {
    'generation-i': [1, 151],
    'generation-ii': [152, 251],
    'generation-iii': [252, 386],
    'generation-iv': [387, 493],
    'generation-v': [494, 649],
    'generation-vi': [650, 721],
    'generation-vii': [722, 809],
    'generation-viii': [810, 905],
    'generation-ix': [906, 1025],
  };
  return ranges[generationKey] ?? null;
};

export {
  buildTypeChips,
  fetchCompletePokemon,
  getDeterministicPokemonOfDay,
  getGenerationRange,
  loadAbilityDetails,
  loadEvolutionChain,
  loadMoveDetails,
};
