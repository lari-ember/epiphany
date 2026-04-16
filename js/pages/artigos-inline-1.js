    Parse.initialize("5YfqtpvHcsmbZ6xMJdi44NtBDDRubXz8cxPy5cbc", "PUbi70m8VLyjXnavTPA3B4fmplgho4F4vBZjyImd");
    Parse.serverURL = "https://parseapi.back4app.com/";

    let todosArtigos = [];
    let filtroAtual = { tipo: null, valor: null };

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function formatarData(data) {
      if (!data) return '';
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function truncar(texto, limite) {
      if (!texto) return '';
      return texto.length > limite ? texto.substring(0, limite) + '...' : texto;
    }

    function renderizarArtigos(artigos) {
      const container = document.getElementById('artigos-container');

      if (!artigos || artigos.length === 0) {
        container.innerHTML = `
          <div class="empty-msg">
            <p class="u-fs-3">📝</p>
            <p>Nenhum artigo encontrado.</p>
            <a href="admin-artigos.html" class="btn btn-outline-light btn-sm">Adicionar artigo</a>
          </div>`;
        return;
      }

      const cards = artigos.map(artigo => {
        const id = escapeHtml(artigo.id);
        const titulo = escapeHtml(artigo.get('titulo') || 'Sem título');
        const subtitulo = escapeHtml(truncar(artigo.get('subtitulo') || '', 120));
        const categoria = escapeHtml(artigo.get('categoria') || '');
        const data = artigo.get('data') || artigo.createdAt;
        const imagem = escapeHtml(artigo.get('imagem') || '');
        const tags = artigo.get('tags') || [];

        const imagemHtml = imagem
          ? `<img src="${imagem}" class="card-img-top" alt="${titulo}">`
          : `<div class="img-placeholder">📄</div>`;

        const categoriaHtml = categoria
          ? `<span class="categoria-badge" onclick="filtrarPorCategoria('${categoria}')" class="u-cursor-pointer">${categoria}</span>`
          : '';

        const tagsHtml = tags.length
          ? tags.map(t => `<span class="tag-item" onclick="filtrarPorTag('${escapeHtml(t)}')">${escapeHtml(t)}</span>`).join('')
          : '';

        return `
          <div class="col-sm-6 mb-4">
            <div class="article-card card">
              ${imagemHtml}
              <div class="card-body d-flex flex-column">
                ${categoriaHtml}
                <h5 class="card-title">
                  <a href="artigo.html?id=${id}">${titulo}</a>
                </h5>
                <p class="card-text flex-grow-1">${subtitulo}</p>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <span class="data-texto">${escapeHtml(formatarData(data))}</span>
                  <a href="artigo.html?id=${id}" class="read-more">Ler mais →</a>
                </div>
                ${tagsHtml ? `<div class="mt-2">${tagsHtml}</div>` : ''}
              </div>
            </div>
          </div>`;
      }).join('');

      container.innerHTML = `<div class="row">${cards}</div>`;
    }

    function renderizarSidebar(artigos) {
      // Categorias
      const categoriasMap = {};
      artigos.forEach(a => {
        const cat = a.get('categoria');
        if (cat) categoriasMap[cat] = (categoriasMap[cat] || 0) + 1;
      });

      const catLista = document.getElementById('categorias-lista');
      if (Object.keys(categoriasMap).length === 0) {
        catLista.innerHTML = '<p class="text-muted" class="u-fs-085">Nenhuma categoria ainda.</p>';
      } else {
        catLista.innerHTML = Object.entries(categoriasMap)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, count]) =>
            `<a class="categoria-item d-flex" onclick="filtrarPorCategoria('${escapeHtml(cat)}')" href="#">
              <span>${escapeHtml(cat)}</span><span class="categoria-count">${count}</span>
            </a>`)
          .join('');
      }

      // Tags
      const tagsSet = {};
      artigos.forEach(a => {
        const tags = a.get('tags') || [];
        tags.forEach(t => { tagsSet[t] = true; });
      });

      const tagsLista = document.getElementById('tags-lista');
      if (Object.keys(tagsSet).length === 0) {
        tagsLista.innerHTML = '<p class="text-muted" class="u-fs-085">Nenhuma tag ainda.</p>';
      } else {
        tagsLista.innerHTML = Object.keys(tagsSet)
          .map(t => `<a class="tag-item" onclick="filtrarPorTag('${escapeHtml(t)}')" href="#">${escapeHtml(t)}</a>`)
          .join('');
      }
    }

    function filtrarPorCategoria(categoria) {
      filtroAtual = { tipo: 'categoria', valor: categoria };
      document.getElementById('secao-titulo').textContent = `Categoria: ${categoria}`;
      const badge = document.getElementById('filtro-ativo-badge');
      document.getElementById('filtro-ativo-texto').textContent = `Categoria: ${categoria}`;
      badge.classList.add('visivel');
      const filtrados = todosArtigos.filter(a => a.get('categoria') === categoria);
      renderizarArtigos(filtrados);
      document.querySelectorAll('.categoria-item').forEach(el => {
        el.classList.toggle('ativo', el.textContent.trim().startsWith(categoria));
      });
    }

    function filtrarPorTag(tag) {
      filtroAtual = { tipo: 'tag', valor: tag };
      document.getElementById('secao-titulo').textContent = `Tag: ${tag}`;
      const badge = document.getElementById('filtro-ativo-badge');
      document.getElementById('filtro-ativo-texto').textContent = `Tag: ${tag}`;
      badge.classList.add('visivel');
      const filtrados = todosArtigos.filter(a => (a.get('tags') || []).includes(tag));
      renderizarArtigos(filtrados);
      document.querySelectorAll('.tag-item').forEach(el => {
        el.classList.toggle('ativo', el.textContent.trim() === tag);
      });
    }

    function limparFiltro() {
      filtroAtual = { tipo: null, valor: null };
      document.getElementById('secao-titulo').textContent = 'Todos os artigos';
      document.getElementById('filtro-ativo-badge').classList.remove('visivel');
      renderizarArtigos(todosArtigos);
      document.querySelectorAll('.categoria-item, .tag-item').forEach(el => el.classList.remove('ativo'));
    }

    async function carregarArtigos() {
      try {
        const Artigo = Parse.Object.extend('Artigo');
        const query = new Parse.Query(Artigo);
        query.equalTo('publicado', true);
        query.descending('data');
        query.limit(100);
        todosArtigos = await query.find();
        renderizarArtigos(todosArtigos);
        renderizarSidebar(todosArtigos);
      } catch (error) {
        document.getElementById('artigos-container').innerHTML = `
          <div class="empty-msg">
            <p class="u-fs-2">⚠️</p>
            <p>Não foi possível carregar os artigos.</p>
            <small class="text-muted">${error.message}</small>
          </div>`;
      }
    }

    carregarArtigos();
  
