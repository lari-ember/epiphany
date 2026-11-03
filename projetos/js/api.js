const BASE_URL = 'https://pokeapi.co/api/v2';

const cache = new Map();
let activeController = null;

const buildKey = (path) => path.startsWith('http') ? path : `${BASE_URL}${path}`;

const fetchJson = async (path, { useAbort = false, cacheable = true } = {}) => {
  const url = buildKey(path);

  if (cacheable && cache.has(url)) {
    return cache.get(url);
  }

  if (useAbort) {
    activeController?.abort();
    activeController = new AbortController();
  }

  const response = await fetch(url, { signal: useAbort ? activeController.signal : undefined });

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${url}`);
  }

  const data = await response.json();

  if (cacheable) {
    cache.set(url, data);
  }

  return data;
};

const fetchPokemon = (query, options = {}) => fetchJson(`/pokemon/${encodeURIComponent(query)}`, options);
const fetchSpecies = (query) => fetchJson(`/pokemon-species/${encodeURIComponent(query)}`);
const fetchEvolutionChain = (idOrUrl) => {
  if (String(idOrUrl).startsWith('http')) {
    return fetchJson(idOrUrl);
  }
  return fetchJson(`/evolution-chain/${encodeURIComponent(idOrUrl)}`);
};

const fetchGeneration = (idOrUrl) => {
  if (String(idOrUrl).startsWith('http')) {
    return fetchJson(idOrUrl);
  }
  return fetchJson(`/generation/${encodeURIComponent(idOrUrl)}`);
};

const fetchMove = (name) => fetchJson(`/move/${encodeURIComponent(name)}`);
const fetchAbility = (name) => fetchJson(`/ability/${encodeURIComponent(name)}`);
const fetchPokemonList = (offset = 0, limit = 50) => fetchJson(`/pokemon?offset=${offset}&limit=${limit}`);

const getPokemonLimit = async () => {
  const data = await fetchJson('/pokemon?limit=1');
  return data.count;
};

export {
  fetchAbility,
  fetchEvolutionChain,
  fetchGeneration,
  fetchMove,
  fetchPokemon,
  fetchPokemonList,
  fetchSpecies,
  getPokemonLimit,
};
