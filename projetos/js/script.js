const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');
const pokemonTypes = document.querySelector('.pokemon__types');
const pokemonAbilities = document.querySelector('.pokemon__abilities');
const pokemonHeight = document.querySelector('.pokemon__height');
const pokemonWeight = document.querySelector('.pokemon__weight');
const pokemonStats = document.querySelector('.pokemon__stats');

const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');

let searchPokemon = 1;
let pokemonLimit = Infinity;

const fetchPokemon = async (pokemon) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemon)}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
};

const fetchPokemonLimit = async () => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');

  if (!response.ok) {
    return Infinity;
  }

  const data = await response.json();
  return data.count;
};

const formatName = (name) => name.replace(/-/g, ' ');

const renderDetails = (data) => {
  pokemonTypes.textContent = data.types.map(({ type }) => formatName(type.name)).join(', ');
  pokemonAbilities.textContent = data.abilities
    .map(({ ability }) => formatName(ability.name))
    .join(', ');
  pokemonHeight.textContent = `${(data.height / 10).toLocaleString('pt-BR')} m`;
  pokemonWeight.textContent = `${(data.weight / 10).toLocaleString('pt-BR')} kg`;
  pokemonStats.replaceChildren(...data.stats.map(({ base_stat: value, stat }) => {
    const item = document.createElement('li');
    item.textContent = `${formatName(stat.name)}: ${value}`;
    return item;
  }));
};

const clearDetails = () => {
  pokemonTypes.textContent = '-';
  pokemonAbilities.textContent = '-';
  pokemonHeight.textContent = '-';
  pokemonWeight.textContent = '-';
  pokemonStats.replaceChildren();
};

const renderPokemon = async (pokemon) => {
  pokemonName.textContent = 'Carregando...';
  pokemonNumber.textContent = '';
  pokemonImage.hidden = true;
  clearDetails();

  let data;

  try {
    data = await fetchPokemon(pokemon);
  } catch (error) {
    pokemonName.textContent = 'Serviço indisponível';
    return;
  }

  if (data) {
    pokemonImage.src = data.sprites.other?.['official-artwork']?.front_default
      || data.sprites.front_default;
    pokemonImage.alt = `Imagem de ${formatName(data.name)}`;
    pokemonImage.hidden = false;
    pokemonName.textContent = formatName(data.name);
    pokemonNumber.textContent = `#${String(data.id).padStart(4, '0')}`;
    renderDetails(data);
    input.value = '';
    searchPokemon = data.id;
    buttonPrev.disabled = searchPokemon <= 1;
    buttonNext.disabled = searchPokemon >= pokemonLimit;
  } else {
    pokemonName.textContent = 'Pokémon não encontrado';
    clearDetails();
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderPokemon(input.value.trim().toLowerCase());
});

buttonPrev.addEventListener('click', () => {
  if (searchPokemon > 1) {
    renderPokemon(searchPokemon - 1);
  }
});

buttonNext.addEventListener('click', () => {
  if (searchPokemon < pokemonLimit) {
    renderPokemon(searchPokemon + 1);
  }
});

const initialize = async () => {
  try {
    pokemonLimit = await fetchPokemonLimit();
  } catch (error) {
    pokemonName.textContent = 'Serviço indisponível';
    return;
  }

  renderPokemon(searchPokemon);
};

initialize();
