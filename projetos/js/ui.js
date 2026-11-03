const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const setupUI = () => {
  const refs = {
    pokemonName: document.querySelector('.pokemon__name'),
    pokemonNamePt: document.querySelector('.pokemon__name-pt'),
    pokemonNumber: document.querySelector('.pokemon__number'),
    pokemonImage: document.querySelector('.pokemon__image'),
    pokemonSpecies: document.querySelector('.pokemon__species'),
    pokemonGeneration: document.querySelector('.pokemon__generation'),
    pokemonRegion: document.querySelector('.pokemon__region'),
    pokemonTypes: document.querySelector('.pokemon__types'),
    form: document.querySelector('.form'),
    input: document.querySelector('.input__search'),
    prevButtons: document.querySelectorAll('.btn-prev'),
    nextButtons: document.querySelectorAll('.btn-next'),
    status: document.getElementById('status-indicator'),
    badge: document.getElementById('mythic-legendary-badge'),
    tabs: [...document.querySelectorAll('.tab')],
    panels: {
      overview: document.getElementById('tab-overview'),
      stats: document.getElementById('tab-stats'),
      evolution: document.getElementById('tab-evolution'),
      forms: document.getElementById('tab-forms'),
      abilities: document.getElementById('tab-abilities'),
      moves: document.getElementById('tab-moves'),
      games: document.getElementById('tab-games'),
      curiosities: document.getElementById('tab-curiosities'),
      wiki: document.getElementById('tab-wiki'),
      compare: document.getElementById('tab-compare'),
    },
    appAnnouncer: document.getElementById('app-announcer'),
    auxNumber: document.querySelector('.aux-number'),
    auxName: document.querySelector('.aux-name'),
    auxGeneration: document.querySelector('.aux-generation'),
    auxRegion: document.querySelector('.aux-region'),
    auxShiny: document.querySelector('.aux-shiny'),
    auxTypes: document.querySelector('.aux-types'),
    auxSprite: document.querySelector('.aux-sprite'),
    favoriteButton: document.getElementById('toggle-favorite'),
    shinyButton: document.getElementById('toggle-shiny'),
    randomButton: document.getElementById('random-pokemon'),
    saveCollectionButton: document.getElementById('save-collection'),
    collectionSelect: document.getElementById('collection-status'),
    generationFilter: document.getElementById('generation-filter'),
    soundButton: document.getElementById('toggle-sound'),
    playCryButton: document.getElementById('play-cry'),
    pokemonDayLabel: document.getElementById('pokemon-of-day'),
    openPokemonDayButton: document.getElementById('open-pokemon-day'),
  };

  const switchTab = (tabName) => {
    refs.tabs.forEach((tab) => {
      const active = tab.dataset.tab === tabName;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-current', active ? 'true' : 'false');
    });

    Object.entries(refs.panels).forEach(([name, panel]) => {
      panel.hidden = name !== tabName;
    });
  };

  const announce = (message) => {
    refs.appAnnouncer.textContent = message;
  };

  const setStatus = (message, mode = 'ok') => {
    refs.status.textContent = message;
    refs.status.style.background = mode === 'error' ? 'rgba(146,20,42,0.85)' : 'rgba(3,75,58,0.8)';
  };

  const setMainImage = (src, alt) => {
    if (!src) {
      refs.pokemonImage.hidden = true;
      return;
    }
    refs.pokemonImage.src = src;
    refs.pokemonImage.alt = alt;
    refs.pokemonImage.hidden = false;
  };

  const setAuxSprite = (src, alt) => {
    if (!src) {
      refs.auxSprite.hidden = true;
      return;
    }
    refs.auxSprite.src = src;
    refs.auxSprite.alt = alt;
    refs.auxSprite.hidden = false;
  };

  const renderTypeChips = (chips) => {
    refs.auxTypes.replaceChildren();
    chips.forEach((chip) => {
      const node = createElement('span', 'type-chip', chip.label);
      node.style.background = chip.color;
      refs.auxTypes.appendChild(node);
    });
  };

  const updateFavoriteState = (isFavorite) => {
    refs.favoriteButton.setAttribute('aria-pressed', String(isFavorite));
    refs.favoriteButton.textContent = isFavorite ? 'Favorito ★' : 'Favorito ☆';
  };

  const updateSoundState = (enabled) => {
    refs.soundButton.setAttribute('aria-pressed', String(enabled));
    refs.soundButton.textContent = enabled ? 'Som ON' : 'Som OFF';
  };

  const updateShinyState = (enabled) => {
    refs.shinyButton.setAttribute('aria-pressed', String(enabled));
    refs.auxShiny.textContent = enabled ? 'ON' : 'OFF';
  };

  const renderMainHeader = (pokemon) => {
    refs.pokemonNumber.textContent = `#${String(pokemon.id).padStart(4, '0')}`;
    refs.pokemonName.textContent = pokemon.name;
    refs.pokemonNamePt.textContent = pokemon.namePt;
    refs.pokemonSpecies.textContent = pokemon.category;
    refs.pokemonGeneration.textContent = pokemon.generationLabel;
    refs.pokemonRegion.textContent = pokemon.region;
    refs.pokemonTypes.textContent = pokemon.types.join(', ');

    refs.auxNumber.textContent = `#${String(pokemon.id).padStart(4, '0')}`;
    refs.auxName.textContent = pokemon.name;
    refs.auxGeneration.textContent = pokemon.generationRoman;
    refs.auxRegion.textContent = pokemon.region;

    if (pokemon.isLegendary || pokemon.isMythical) {
      refs.badge.hidden = false;
      refs.badge.textContent = pokemon.isMythical ? 'Mítico' : 'Lendário';
      refs.badge.style.background = pokemon.isMythical ? '#5f2aff' : '#ff7f11';
    } else {
      refs.badge.hidden = true;
    }
  };

  const renderOverview = (pokemon, history, favorites, collectionStatus) => {
    refs.panels.overview.innerHTML = '';

    const title = createElement('h3', null, 'Dados gerais');
    const grid = createElement('dl', 'data-grid');

    const rows = [
      ['Nome em português', pokemon.namePt],
      ['Categoria', pokemon.category],
      ['Descrição', pokemon.pokedexEntry],
      ['Altura', `${pokemon.height} m`],
      ['Peso', `${pokemon.weight} kg`],
      ['Experiência base', String(pokemon.baseExperience ?? '-')],
      ['Taxa de captura', String(pokemon.captureRate ?? '-')],
      ['Grupo de crescimento', pokemon.growthRate],
      ['Habitat', pokemon.habitat],
      ['Grupos de ovo', pokemon.eggGroups.join(', ') || '-'],
      ['Ciclos de incubação', String(pokemon.hatchCounter ?? '-')],
      ['Coleção', collectionStatus],
      ['Favorito', favorites.has(pokemon.id) ? 'Sim' : 'Não'],
      ['Histórico recente', history.map((item) => item.name).join(', ') || 'Sem histórico'],
    ];

    rows.forEach(([term, value]) => {
      const dt = createElement('dt', null, term);
      const dd = createElement('dd', null, value || '-');
      grid.append(dt, dd);
    });

    refs.panels.overview.append(title, grid);
  };

  const renderStats = (pokemon) => {
    refs.panels.stats.innerHTML = '<h3>Estatísticas base</h3>';

    const list = createElement('div', 'stats-list');
    pokemon.stats.forEach((stat) => {
      const row = createElement('div', 'stat-row');
      const label = createElement('span', null, stat.name);
      const track = createElement('span');
      const bar = createElement('span', 'stat-bar');
      bar.style.width = `${Math.min(100, (stat.value / 255) * 100)}%`;
      track.appendChild(bar);
      const value = createElement('span', null, String(stat.value));
      row.append(label, track, value);
      list.appendChild(row);
    });

    const summary = createElement('p', null, `BST: ${pokemon.bst} · Destaque: ${pokemon.topStat.name}`);
    refs.panels.stats.append(list, summary);
  };

  const renderEvolution = (chain) => {
    refs.panels.evolution.innerHTML = '<h3>Cadeia evolutiva</h3>';
    const wrapper = createElement('div', 'evolution-chain');

    if (!chain.length) {
      wrapper.appendChild(createElement('p', null, 'Dados de evolução indisponíveis.'));
      refs.panels.evolution.appendChild(wrapper);
      return;
    }

    chain.forEach((step) => {
      const btn = createElement('button', 'control-btn evolution-link');
      btn.type = 'button';
      btn.dataset.pokemonName = step.name;
      const details = [step.trigger, step.minLevel ? `nível ${step.minLevel}` : null, step.item, step.condition]
        .filter(Boolean)
        .join(' · ');
      btn.textContent = `${step.name} ${details ? `(${details})` : ''}`;
      wrapper.appendChild(btn);
    });

    refs.panels.evolution.appendChild(wrapper);
  };

  const renderForms = (pokemon) => {
    refs.panels.forms.innerHTML = '<h3>Formas alternativas</h3>';
    const wrapper = createElement('div', 'forms-grid');

    if (!pokemon.forms.length) {
      wrapper.appendChild(createElement('p', null, 'Sem formas alternativas cadastradas.'));
    } else {
      pokemon.forms.forEach((form) => {
        const btn = createElement('button', 'control-btn form-btn', form.name);
        btn.type = 'button';
        btn.dataset.formName = form.key;
        wrapper.appendChild(btn);
      });
    }

    refs.panels.forms.appendChild(wrapper);
  };

  const renderAbilities = (pokemon, abilityDetailsMap = new Map()) => {
    refs.panels.abilities.innerHTML = '<h3>Habilidades</h3>';
    const list = createElement('div', 'ability-list');

    pokemon.abilities.forEach((ability) => {
      const card = createElement('article');
      const title = createElement('p', null, `${ability.name}${ability.hidden ? ' (Oculta)' : ''}`);
      const detail = abilityDetailsMap.get(ability.key)?.effect ?? 'Carregue a aba para ver detalhes.';
      const desc = createElement('p', null, detail);
      card.append(title, desc);
      list.appendChild(card);
    });

    refs.panels.abilities.appendChild(list);
  };

  const renderMoves = (pokemon, moveDetailsMap = new Map()) => {
    refs.panels.moves.innerHTML = '<h3>Golpes</h3>';
    const list = createElement('div', 'moves-grid');

    const selected = pokemon.moves.slice(0, 24);
    if (!selected.length) {
      list.appendChild(createElement('p', null, 'Sem dados de golpes.'));
    } else {
      selected.forEach((move) => {
        const moveDetails = moveDetailsMap.get(move.key);
        const card = createElement('article');
        const title = createElement('p', null, move.name);
        const attrs = createElement('p', null, moveDetails
          ? `${moveDetails.type} · ${moveDetails.damageClass} · Poder ${moveDetails.power} · PP ${moveDetails.pp}`
          : `Método: ${move.methods.join(', ') || '-'}${move.level ? ` · Nível ${move.level}` : ''}`);
        const effect = createElement('p', null, moveDetails?.effect ?? 'Detalhes sob demanda.');
        card.append(title, attrs, effect);
        list.appendChild(card);
      });
    }

    refs.panels.moves.appendChild(list);
  };

  const renderGames = (pokemon) => {
    refs.panels.games.innerHTML = '<h3>Jogos</h3>';
    const list = createElement('div', 'games-grid');

    const debut = pokemon.debut
      ? `${pokemon.debut.game} (${pokemon.debut.year ?? 'ano não confirmado'}) · ${pokemon.debut.generation} · ${pokemon.debut.region}`
      : 'Informação não cadastrada';

    list.appendChild(createElement('p', null, `Estreia oficial: ${debut}`));
    list.appendChild(createElement('p', null, `Fonte da estreia: ${pokemon.debut?.source ?? 'Informação não cadastrada'}`));

    const availability = pokemon.availability;
    if (availability) {
      list.appendChild(createElement('p', null, `Disponível em gameplay: ${availability.catchableIn?.join(', ') || 'Informação não cadastrada'}`));
      list.appendChild(createElement('p', null, `Transferência apenas em: ${availability.transferOnlyIn?.join(', ') || 'Informação não cadastrada'}`));
      list.appendChild(createElement('p', null, `Não disponível: ${availability.notAvailableIn?.join(', ') || 'Informação não cadastrada'}`));
      list.appendChild(createElement('p', null, `Fonte de disponibilidade: ${availability.source ?? 'Informação não cadastrada'}`));
    } else {
      list.appendChild(createElement('p', null, 'Disponibilidade por captura/transferência: Informação não cadastrada'));
    }

    if (pokemon.games.length) {
      list.appendChild(createElement('p', null, `Aparece em: ${pokemon.games.slice(0, 20).join(', ')}`));
    } else {
      list.appendChild(createElement('p', null, 'Sem lista de jogos disponível na API para este Pokémon.'));
    }

    if (pokemon.generationGames.length) {
      list.appendChild(createElement('p', null, `Jogos da geração: ${pokemon.generationGames.join(', ')}`));
    }

    refs.panels.games.appendChild(list);
  };

  const renderCuriosities = (pokemon) => {
    refs.panels.curiosities.innerHTML = '<h3>Curiosidades</h3>';
    const list = createElement('ul');

    const curiosities = [
      `Formato corporal: ${pokemon.shape}.`,
      pokemon.isLegendary ? 'Este Pokémon é classificado como lendário.' : 'Este Pokémon não é lendário.',
      pokemon.isMythical ? 'Este Pokémon é classificado como mítico.' : 'Este Pokémon não é mítico.',
      pokemon.formsSwitchable ? 'Possui múltiplas formas registradas.' : 'Não possui múltiplas formas registradas.',
      ...(pokemon.editorialCuriosities.length ? pokemon.editorialCuriosities : ['Curiosidades editoriais: Informação não cadastrada.']),
    ];

    curiosities.forEach((item) => list.appendChild(createElement('li', null, item)));
    refs.panels.curiosities.appendChild(list);
  };

  const renderWiki = (pokemon) => {
    refs.panels.wiki.innerHTML = '<h3>Wiki e referências</h3>';
    const links = createElement('ul');

    const urlName = pokemon.name.toLowerCase().replace(/\s+/g, '_');
    const resources = [
      ['Bulbapedia', `https://bulbapedia.bulbagarden.net/wiki/${urlName}_(Pok%C3%A9mon)`],
      ['Pokémon Database', `https://pokemondb.net/pokedex/${pokemon.name.toLowerCase().replace(/\s+/g, '-')}`],
      ['Serebii', `https://www.serebii.net/pokemon/${String(pokemon.id).padStart(3, '0')}.shtml`],
      ['PokéAPI', `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`],
      ['Site oficial Pokémon', `https://www.pokemon.com/us/pokedex/${pokemon.name.toLowerCase().replace(/\s+/g, '-')}`],
    ];

    resources.forEach(([label, href]) => {
      const li = createElement('li');
      const link = createElement('a', null, label);
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      li.appendChild(link);
      links.appendChild(li);
    });

    refs.panels.wiki.appendChild(links);
  };

  const renderCompare = (pokemon, comparePokemon) => {
    refs.panels.compare.innerHTML = '<h3>Comparador Pokémon</h3>';

    if (!comparePokemon) {
      refs.panels.compare.appendChild(createElement('p', null, 'Escolha um Pokémon para comparar usando o campo abaixo.'));
      const input = createElement('input');
      input.placeholder = 'Nome ou número para comparar';
      input.className = 'input__search';
      input.id = 'compare-input';
      const button = createElement('button', 'control-btn', 'Comparar');
      button.type = 'button';
      button.id = 'compare-submit';
      refs.panels.compare.append(input, button);
      return;
    }

    const grid = createElement('dl', 'data-grid');
    const rows = [
      ['Pokémon A', `${pokemon.name} (#${pokemon.id})`],
      ['Pokémon B', `${comparePokemon.name} (#${comparePokemon.id})`],
      ['Tipos', `${pokemon.types.join(', ')} vs ${comparePokemon.types.join(', ')}`],
      ['Altura', `${pokemon.height}m vs ${comparePokemon.height}m`],
      ['Peso', `${pokemon.weight}kg vs ${comparePokemon.weight}kg`],
      ['Habilidades', `${pokemon.abilities.map((item) => item.name).join(', ')} vs ${comparePokemon.abilities.map((item) => item.name).join(', ')}`],
      ['BST', `${pokemon.bst} vs ${comparePokemon.bst}`],
    ];

    rows.forEach(([k, v]) => {
      grid.append(createElement('dt', null, k), createElement('dd', null, v));
    });

    refs.panels.compare.appendChild(grid);
  };

  const renderPokemon = ({ pokemon, chips, history, favorites, collectionStatus, isShiny }) => {
    renderMainHeader(pokemon);
    setMainImage(pokemon.artwork, `Imagem de ${pokemon.name}`);
    setAuxSprite(pokemon.sprite, `Sprite de ${pokemon.name}`);
    renderTypeChips(chips);
    updateShinyState(isShiny);
    renderOverview(pokemon, history, favorites, collectionStatus);
    renderStats(pokemon);
    renderForms(pokemon);
    renderGames(pokemon);
    renderCuriosities(pokemon);
    renderWiki(pokemon);
    renderCompare(pokemon, null);
  };

  const renderPokemonDay = (text) => {
    refs.pokemonDayLabel.textContent = text;
  };

  return {
    announce,
    refs,
    renderAbilities,
    renderCompare,
    renderEvolution,
    renderMoves,
    renderPokemon,
    renderPokemonDay,
    setStatus,
    switchTab,
    updateFavoriteState,
    updateSoundState,
    updateShinyState,
  };
};

export { setupUI };
