const FAVORITES_KEY = 'epiphany:pokedex:favorites';
const COLLECTION_KEY = 'epiphany:pokedex:collection';
const SETTINGS_KEY = 'epiphany:pokedex:settings';
const HISTORY_KEY = 'epiphany:pokedex:history';

const safeRead = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFavorites = () => new Set(safeRead(FAVORITES_KEY, []));
const saveFavorites = (favorites) => safeWrite(FAVORITES_KEY, [...favorites]);

const getCollection = () => safeRead(COLLECTION_KEY, {});
const saveCollection = (collection) => safeWrite(COLLECTION_KEY, collection);

const getSettings = () => safeRead(SETTINGS_KEY, { soundEnabled: true, fontScale: 1, shiny: false });
const saveSettings = (settings) => safeWrite(SETTINGS_KEY, settings);

const getHistory = () => safeRead(HISTORY_KEY, []);
const pushHistory = (entry) => {
  const history = getHistory().filter((item) => item.id !== entry.id);
  history.unshift(entry);
  safeWrite(HISTORY_KEY, history.slice(0, 20));
  return history.slice(0, 20);
};

export {
  getCollection,
  getFavorites,
  getHistory,
  getSettings,
  pushHistory,
  saveCollection,
  saveFavorites,
  saveSettings,
};
