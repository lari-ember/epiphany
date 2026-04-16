    Parse.initialize("5YfqtpvHcsmbZ6xMJdi44NtBDDRubXz8cxPy5cbc", "PUbi70m8VLyjXnavTPA3B4fmplgho4F4vBZjyImd");
    Parse.serverURL = "https://parseapi.back4app.com/";

    function formatarData(data) {
      if (!data) return '';
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function getIdFromUrl() {
      const params = new URLSearchParams(window.location.search);
      return params.get('id');
    }

    async function carregarArtigo() {
      const id = getIdFromUrl();
      if (!id) {
        mostrarErro();
        return;
      }

      try {
        const Artigo = Parse.Object.extend('Artigo');
        const query = new Parse.Query(Artigo);
        const artigo = await query.get(id);

        if (!artigo) {
          mostrarErro();
          return;
        }

        renderizarArtigo(artigo);
        await carregarRelacionados(artigo);
        await carregarMaisArtigos(id);

      } catch (error) {
        mostrarErro();
      }
    }

    function renderizarArtigo(artigo) {
      const titulo = artigo.get('titulo') || 'Sem título';
      const subtitulo = artigo.get('subtitulo') || '';
      const categoria = artigo.get('categoria') || '';
      const conteudo = artigo.get('conteudo') || '';
      const data = artigo.get('data') || artigo.createdAt;
      const imagem = artigo.get('imagem') || '';
      const tags = artigo.get('tags') || [];
      const autor = artigo.get('autor') || 'Larissa Ember';

      document.title = `${titulo} — The Last Epiphany`;
      document.querySelector('meta[name="description"]').setAttribute('content', subtitulo);

      document.getElementById('artigo-titulo').textContent = titulo;
      document.getElementById('artigo-subtitulo').textContent = subtitulo;
      document.getElementById('artigo-data').textContent = formatarData(data);
      document.getElementById('artigo-autor').textContent = autor;

      if (categoria) {
        document.getElementById('artigo-categoria').textContent = categoria;
      } else {
        document.getElementById('artigo-categoria').style.display = 'none';
      }

      if (imagem) {
        const imgEl = document.getElementById('artigo-imagem');
        imgEl.src = imagem;
        imgEl.alt = titulo;
        imgEl.style.display = 'block';
      }

      document.getElementById('artigo-conteudo').innerHTML = DOMPurify.sanitize(conteudo);

      if (tags.length > 0) {
        document.getElementById('artigo-tags-container').style.display = 'block';
        document.getElementById('artigo-tags').innerHTML = tags
          .map(t => `<a href="artigos.html" class="tag-item" onclick="sessionStorage.setItem('filtroTag','${t}')">${t}</a>`)
          .join('');
      }

      document.getElementById('loading-section').style.display = 'none';
      document.getElementById('artigo-section').style.display = 'block';
    }

    async function carregarRelacionados(artigo) {
      const id = artigo.id;
      const categoria = artigo.get('categoria');
      const tags = artigo.get('tags') || [];

      if (!categoria && tags.length === 0) return;

      try {
        const Artigo = Parse.Object.extend('Artigo');
        const resultados = [];

        if (categoria) {
          const q1 = new Parse.Query(Artigo);
          q1.equalTo('categoria', categoria);
          q1.equalTo('publicado', true);
          q1.notEqualTo('objectId', id);
          q1.limit(3);
          const r1 = await q1.find();
          r1.forEach(a => { if (!resultados.find(r => r.id === a.id)) resultados.push(a); });
        }

        if (tags.length > 0 && resultados.length < 3) {
          const q2 = new Parse.Query(Artigo);
          q2.containedIn('tags', tags);
          q2.equalTo('publicado', true);
          q2.notEqualTo('objectId', id);
          q2.limit(3);
          const r2 = await q2.find();
          r2.forEach(a => { if (!resultados.find(r => r.id === a.id)) resultados.push(a); });
        }

        if (resultados.length > 0) {
          const widget = document.getElementById('relacionados-widget');
          widget.style.display = 'block';
          const lista = document.getElementById('relacionados-lista');
          lista.innerHTML = resultados.slice(0, 4).map(a => {
            const img = a.get('imagem');
            const thumbHtml = img
              ? `<img src="${img}" class="related-thumb" alt="">`
              : `<div class="related-thumb-placeholder">📄</div>`;
            return `
              <a href="artigo.html?id=${a.id}" class="related-card">
                ${thumbHtml}
                <div class="related-info">
                  <div class="u-fs-09">${a.get('titulo') || 'Sem título'}</div>
                  <small>${formatarData(a.get('data') || a.createdAt)}</small>
                </div>
              </a>`;
          }).join('');
        }
      } catch (e) {
        // silently ignore
      }
    }

    async function carregarMaisArtigos(idAtual) {
      try {
        const Artigo = Parse.Object.extend('Artigo');
        const query = new Parse.Query(Artigo);
        query.equalTo('publicado', true);
        query.descending('data');
        query.notEqualTo('objectId', idAtual);
        query.limit(5);
        const artigos = await query.find();

        const lista = document.getElementById('mais-artigos-lista');
        if (artigos.length === 0) {
          lista.innerHTML = '<p class="text-muted" class="u-fs-085">Nenhum outro artigo.</p>';
          return;
        }

        lista.innerHTML = artigos.map(a => {
          const img = a.get('imagem');
          const thumbHtml = img
            ? `<img src="${img}" class="related-thumb" alt="">`
            : `<div class="related-thumb-placeholder">📄</div>`;
          return `
            <a href="artigo.html?id=${a.id}" class="related-card">
              ${thumbHtml}
              <div class="related-info">
                <div class="u-fs-09">${a.get('titulo') || 'Sem título'}</div>
                <small>${formatarData(a.get('data') || a.createdAt)}</small>
              </div>
            </a>`;
        }).join('');
      } catch (e) {
        // silently ignore
      }
    }

    function mostrarErro() {
      document.getElementById('loading-section').style.display = 'none';
      document.getElementById('erro-section').style.display = 'block';
    }

    carregarArtigo();
  
