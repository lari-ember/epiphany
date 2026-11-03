import { getPokemonLimit } from './api.js';
import {
  buildTypeChips,
  fetchCompletePokemon,
  getDeterministicPokemonOfDay,
  getGenerationRange,
  loadAbilityDetails,
  loadEvolutionChain,
  loadMoveDetails,
} from './pokemon.js';
import { setupUI } from './ui.js';
import { setupNavigation } from './navigation.js';
import {
  getCollection,
  getFavorites,
  getHistory,
  getSettings,
  pushHistory,
  saveCollection,
  saveFavorites,
  saveSettings,
} from './storage.js';

const ui = setupUI();
const { refs } = ui;

const state = {
  currentId: 1,
  pokemon: null,
  comparePokemon: null,
  pokemonLimit: 1025,
  activeTab: 'overview',
  loadingTab: new Set(),
  favorites: getFavorites(),
  collection: getCollection(),
  settings: getSettings(),
  history: getHistory(),
  debutData: {},
};

const rangeClamp = (id) => Math.min(state.pokemonLimit, Math.max(1, id));

const getCollectionLabel = (id) => {
  const labels = {
    missing: 'Ainda não capturado',
    caught: 'Capturado',
    shiny: 'Shiny capturado',
    favorite: 'Favorito',
  };
  return labels[state.collection[id] ?? 'missing'];
};

const getCurrentRange = () => {
  const selected = refs.generationFilter.value;
  if (selected === 'all') return [1, state.pokemonLimit];
  return getGenerationRange(selected) ?? [1, state.pokemonLimit];
};

const isInsideRange = (id) => {
  const [start, end] = getCurrentRange();
  return id >= start && id <= end;
};

const updateNavButtons = () => {
  const [start, end] = getCurrentRange();
  const disablePrev = state.currentId <= start;
  const disableNext = state.currentId >= Math.min(end, state.pokemonLimit);

  refs.prevButtons.forEach((btn) => { btn.disabled = disablePrev; });
  refs.nextButtons.forEach((btn) => { btn.disabled = disableNext; });
};

const refreshTopLevelUI = () => {
  if (!state.pokemon) return;
  ui.renderPokemon({
    pokemon: state.pokemon,
    chips: buildTypeChips(state.pokemon.types),
    history: state.history,
    favorites: state.favorites,
    collectionStatus: getCollectionLabel(state.pokemon.id),
    isShiny: state.settings.shiny,
  });

  ui.updateFavoriteState(state.favorites.has(state.pokemon.id));
  refs.collectionSelect.value = state.collection[state.pokemon.id] ?? 'missing';
  updateNavButtons();
};

const loadDebutData = async () => {
  try {
    const response = await fetch('./js/data/pokemon-debuts.json');
    if (!response.ok) throw new Error('Sem metadados de estreia.');
    state.debutData = await response.json();
  } catch {
    state.debutData = {};
  }
};

const renderTab = async (tabName) => {
  if (!state.pokemon) return;

  if (tabName === 'evolution' && !state.loadingTab.has(tabName)) {
    state.loadingTab.add(tabName);
    try {
      const chain = await loadEvolutionChain(state.pokemon.evolutionChainUrl);
      ui.renderEvolution(chain);
    } catch {
      ui.renderEvolution([]);
    }
  }

  if (tabName === 'abilities' && !state.loadingTab.has(tabName)) {
    state.loadingTab.add(tabName);
    const details = new Map();
    await Promise.all(state.pokemon.abilities.map(async (ability) => {
      try {
        details.set(ability.key, await loadAbilityDetails(ability.key));
      } catch {
        details.set(ability.key, { effect: 'Descrição indisponível no momento.' });
      }
    }));
    ui.renderAbilities(state.pokemon, details);
  }

  if (tabName === 'moves' && !state.loadingTab.has(tabName)) {
    state.loadingTab.add(tabName);
    const details = new Map();
    const targetMoves = state.pokemon.moves.slice(0, 24);
    await Promise.all(targetMoves.map(async (move) => {
      try {
        details.set(move.key, await loadMoveDetails(move.key));
      } catch {
        details.set(move.key, null);
      }
    }));
    ui.renderMoves(state.pokemon, details);
  }

  if (tabName === 'compare') {
    ui.renderCompare(state.pokemon, state.comparePokemon);
    bindCompareHandlers();
  }

  ui.switchTab(tabName);
  state.activeTab = tabName;
};

const applyGenerationFilter = async () => {
  const [start] = getCurrentRange();
  if (!isInsideRange(state.currentId)) {
    await renderPokemon(start);
    return;
  }
  updateNavButtons();
};

const setLoading = () => {
  ui.setStatus('Carregando...', 'ok');
};

const renderPokemon = async (query) => {
  setLoading();
  state.loadingTab.clear();

  try {
    const pokemon = await fetchCompletePokemon({
      query,
      isShiny: state.settings.shiny,
      debutData: state.debutData,
      signalSearch: true,
    });

    state.currentId = pokemon.id;
    state.pokemon = pokemon;
    state.history = pushHistory({ id: pokemon.id, name: pokemon.name });

    refreshTopLevelUI();
    ui.setStatus('Conectado', 'ok');
    ui.announce(`${pokemon.name} carregado`);

    await renderTab(state.activeTab);
  } catch {
    ui.setStatus('Falha na conexão', 'error');
    ui.announce('Não foi possível carregar o Pokémon');
  }
};

const stepPokemon = async (delta) => {
  const [start, end] = getCurrentRange();
  const next = state.currentId + delta;
  if (next < start || next > end || next > state.pokemonLimit || next < 1) return;
  await renderPokemon(next);
};

const toggleShiny = async () => {
  state.settings.shiny = !state.settings.shiny;
  saveSettings(state.settings);
  ui.updateShinyState(state.settings.shiny);
  if (state.pokemon) {
    await renderPokemon(state.currentId);
  }
};

const openRandomPokemon = async () => {
  const [start, end] = getCurrentRange();
  const randomId = Math.floor(Math.random() * (Math.min(end, state.pokemonLimit) - start + 1)) + start;
  await renderPokemon(randomId);
};

const toggleFavorite = () => {
  if (!state.pokemon) return;

  if (state.favorites.has(state.pokemon.id)) {
    state.favorites.delete(state.pokemon.id);
  } else {
    state.favorites.add(state.pokemon.id);
  }

  saveFavorites(state.favorites);
  ui.updateFavoriteState(state.favorites.has(state.pokemon.id));
  refreshTopLevelUI();
};

const saveCollectionStatus = () => {
  if (!state.pokemon) return;

  const status = refs.collectionSelect.value;
  state.collection[state.pokemon.id] = status;
  saveCollection(state.collection);
  refreshTopLevelUI();
  ui.announce('Status da coleção atualizado');
};

let cryAudio = null;
const playCry = () => {
  if (!state.settings.soundEnabled || !state.pokemon?.cry) return;
  cryAudio?.pause();
  cryAudio = new Audio(state.pokemon.cry);
  cryAudio.play().catch(() => {});
};

const toggleSound = () => {
  state.settings.soundEnabled = !state.settings.soundEnabled;
  saveSettings(state.settings);
  ui.updateSoundState(state.settings.soundEnabled);
};

const bindPanelClickActions = () => {
  refs.panels.evolution.addEventListener('click', async (event) => {
    const btn = event.target.closest('.evolution-link');
    if (!btn) return;
    await renderPokemon(btn.dataset.pokemonName);
  });

  refs.panels.forms.addEventListener('click', async (event) => {
    const btn = event.target.closest('.form-btn');
    if (!btn) return;
    await renderPokemon(btn.dataset.formName);
  });
};

const bindCompareHandlers = () => {
  const compareInput = document.getElementById('compare-input');
  const compareSubmit = document.getElementById('compare-submit');

  if (!compareInput || !compareSubmit) return;

  compareSubmit.onclick = async () => {
    const value = compareInput.value.trim().toLowerCase();
    if (!value) return;

    try {
      const pokemon = await fetchCompletePokemon({
        query: value,
        isShiny: false,
        debutData: state.debutData,
        signalSearch: false,
      });
      state.comparePokemon = pokemon;
      ui.renderCompare(state.pokemon, state.comparePokemon);
    } catch {
      ui.announce('Pokémon para comparação não encontrado');
    }
  };
};

const updatePokemonOfDay = async () => {
  try {
    const id = await getDeterministicPokemonOfDay();
    const data = await fetchCompletePokemon({
      query: id,
      isShiny: false,
      debutData: state.debutData,
      signalSearch: false,
    });
    refs.openPokemonDayButton.dataset.pokemonId = String(id);
    ui.renderPokemonDay(`${data.name} (#${String(id).padStart(4, '0')})`);
  } catch {
    ui.renderPokemonDay('Indisponível no momento');
  }
};

const moveTabFocus = (direction) => {
  const index = refs.tabs.findIndex((tab) => tab.dataset.tab === state.activeTab);
  const nextIndex = (index + direction + refs.tabs.length) % refs.tabs.length;
  const tab = refs.tabs[nextIndex];
  renderTab(tab.dataset.tab);
  tab.focus();
};

const handleControlAction = async (action) => {
  if (action === 'prev') return stepPokemon(-1);
  if (action === 'next') return stepPokemon(1);
  if (action === 'tabPrev') return moveTabFocus(-1);
  if (action === 'tabNext') return moveTabFocus(1);
  if (action === 'confirm') return renderTab(state.activeTab);
  if (action === 'back') return renderTab('overview');
};

const setupEvents = () => {
  refs.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const value = refs.input.value.trim().toLowerCase();
    if (!value) return;
    await renderPokemon(value);
    refs.input.value = '';
  });

  refs.shinyButton.addEventListener('click', toggleShiny);
  refs.randomButton.addEventListener('click', openRandomPokemon);
  refs.favoriteButton.addEventListener('click', toggleFavorite);
  refs.saveCollectionButton.addEventListener('click', saveCollectionStatus);
  refs.soundButton.addEventListener('click', toggleSound);
  refs.playCryButton.addEventListener('click', playCry);
  refs.generationFilter.addEventListener('change', applyGenerationFilter);
  refs.openPokemonDayButton.addEventListener('click', async () => {
    const id = refs.openPokemonDayButton.dataset.pokemonId;
    if (id) await renderPokemon(Number(id));
  });

  bindPanelClickActions();

  setupNavigation({
    refs,
    onAction: handleControlAction,
    onTabSelect: renderTab,
  });
};

const initialize = async () => {
  await loadDebutData();

  try {
    state.pokemonLimit = await getPokemonLimit();
  } catch {
    state.pokemonLimit = 1025;
  }

  ui.updateSoundState(state.settings.soundEnabled);
  ui.updateShinyState(state.settings.shiny);

  setupEvents();
  await updatePokemonOfDay();
  await renderPokemon(state.currentId);
};

initialize();
