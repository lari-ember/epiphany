    Parse.initialize("5YfqtpvHcsmbZ6xMJdi44NtBDDRubXz8cxPy5cbc", "PUbi70m8VLyjXnavTPA3B4fmplgho4F4vBZjyImd");
    Parse.serverURL = "https://parseapi.back4app.com/";

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function sanitizeUrl(url) {
      const valor = (url || '').trim();
      if (!valor) return '';
      try {
        const parsed = new URL(valor, window.location.href);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.href : '';
      } catch (_) {
        return '';
      }
    }

    function mostrarToast(msg, tipo) {
      const el = document.getElementById('toast-msg');
      const texto = document.getElementById('toast-texto');
      texto.textContent = msg;
      el.className = `toast align-items-center text-white border-0 bg-${tipo === 'erro' ? 'danger' : 'success'}`;
      const t = new bootstrap.Toast(el, { delay: 3500 });
      t.show();
    }

    async function entrar() {
      const usuario = document.getElementById('usuario-input').value.trim();
      const senha = document.getElementById('senha-input').value;
      const erroEl = document.getElementById('login-erro');
      const btn = document.getElementById('btn-login');

      if (!usuario || !senha) {
        erroEl.textContent = 'Preencha usuário e senha.';
        erroEl.style.display = 'block';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Entrando...';
      erroEl.style.display = 'none';

      try {
        await Parse.User.logIn(usuario, senha);
        mostrarPainel();
      } catch (error) {
        erroEl.textContent = 'Usuário ou senha incorretos.';
        erroEl.style.display = 'block';
        document.getElementById('senha-input').value = '';
        document.getElementById('senha-input').focus();
      }

      btn.disabled = false;
      btn.textContent = 'Entrar';
    }

    function mostrarPainel() {
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('admin-section').style.display = 'block';
      carregarListaArtigos();
      definirDataHoje();
    }

    async function sair() {
      await Parse.User.logOut();
      document.getElementById('admin-section').style.display = 'none';
      document.getElementById('login-section').style.display = 'block';
      document.getElementById('usuario-input').value = '';
      document.getElementById('senha-input').value = '';
    }

    function definirDataHoje() {
      const hoje = new Date().toISOString().split('T')[0];
      document.getElementById('campo-data').value = hoje;
    }

    function previewImagem() {
      const url = sanitizeUrl(document.getElementById('campo-imagem').value);
      const preview = document.getElementById('imagem-preview');
      if (url) {
        preview.src = url;
        preview.style.display = 'block';
        preview.onerror = () => { preview.style.display = 'none'; };
      } else {
        preview.style.display = 'none';
      }
    }

    function limparFormulario() {
      document.getElementById('artigo-id').value = '';
      document.getElementById('campo-titulo').value = '';
      document.getElementById('campo-subtitulo').value = '';
      document.getElementById('campo-categoria').value = '';
      document.getElementById('campo-autor').value = 'Larissa Ember';
      document.getElementById('campo-tags').value = '';
      document.getElementById('campo-conteudo').value = '';
      document.getElementById('campo-imagem').value = '';
      document.getElementById('campo-publicado').checked = true;
      document.getElementById('imagem-preview').style.display = 'none';
      document.getElementById('form-feedback').style.display = 'none';
      document.getElementById('form-titulo-header').textContent = '✏️ Novo Artigo';
      document.getElementById('btn-salvar').textContent = 'Salvar Artigo';
      document.getElementById('btn-cancelar-edicao').style.display = 'none';
      definirDataHoje();
    }

    function cancelarEdicao() {
      limparFormulario();
    }

    async function salvarArtigo() {
      const titulo = document.getElementById('campo-titulo').value.trim();
      if (!titulo) {
        mostrarFeedback('O título é obrigatório.', 'danger');
        return;
      }

      const btn = document.getElementById('btn-salvar');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner u-spinner-sm"></span> Salvando...';

      try {
        const Artigo = Parse.Object.extend('Artigo');
        const id = document.getElementById('artigo-id').value;
        let artigo;

        if (id) {
          const query = new Parse.Query(Artigo);
          artigo = await query.get(id);
        } else {
          artigo = new Artigo();
        }

        const tagsStr = document.getElementById('campo-tags').value;
        const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);

        const dataStr = document.getElementById('campo-data').value;
        const dataObj = dataStr ? new Date(dataStr + 'T12:00:00') : new Date();

        artigo.set('titulo', titulo);
        artigo.set('subtitulo', document.getElementById('campo-subtitulo').value.trim());
        artigo.set('categoria', document.getElementById('campo-categoria').value.trim());
        artigo.set('autor', document.getElementById('campo-autor').value.trim() || 'Larissa Ember');
        artigo.set('conteudo', document.getElementById('campo-conteudo').value.trim());
        artigo.set('imagem', sanitizeUrl(document.getElementById('campo-imagem').value));
        artigo.set('tags', tags);
        artigo.set('data', dataObj);
        artigo.set('publicado', document.getElementById('campo-publicado').checked);

        const salvo = await artigo.save();

        mostrarToast(id ? 'Artigo atualizado com sucesso!' : 'Artigo criado com sucesso!', 'sucesso');
        limparFormulario();
        carregarListaArtigos();

      } catch (error) {
        mostrarFeedback('Erro ao salvar: ' + error.message, 'danger');
      }

      btn.disabled = false;
      btn.textContent = 'Salvar Artigo';
    }

    function mostrarFeedback(msg, tipo) {
      const el = document.getElementById('form-feedback');
      el.className = `alert alert-${tipo}`;
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 5000);
    }

    async function carregarListaArtigos() {
      const lista = document.getElementById('lista-artigos-admin');
      lista.innerHTML = '<div class="text-center py-3"><div class="loading-spinner"></div></div>';

      try {
        const Artigo = Parse.Object.extend('Artigo');
        const query = new Parse.Query(Artigo);
        query.descending('data');
        query.limit(100);
        const artigos = await query.find();

        // Preencher sugestões de categorias
        const cats = [...new Set(artigos.map(a => a.get('categoria')).filter(Boolean))];
        document.getElementById('categorias-sugestoes').innerHTML = cats.map(c => `<option value="${c}">`).join('');

        if (artigos.length === 0) {
          lista.innerHTML = '<p class="text-muted text-center py-3 u-fs-09">Nenhum artigo ainda. Crie o primeiro!</p>';
          return;
        }

        lista.innerHTML = artigos.map(a => {
          const titulo = escapeHtml(a.get('titulo') || 'Sem título');
          const cat = escapeHtml(a.get('categoria') || '');
          const pub = a.get('publicado');
          const data = a.get('data') || a.createdAt;
          const dataStr = new Date(data).toLocaleDateString('pt-BR');

          return `
            <div class="artigo-lista-item">
              <div class="flex-grow-1">
                <div class="info-titulo">${titulo}</div>
                <div class="info-meta d-flex gap-2 align-items-center mt-1 flex-wrap">
                  ${cat ? `<span class="badge-categoria">${cat}</span>` : ''}
                  ${pub ? '' : '<span class="badge-rascunho">Rascunho</span>'}
                  <span>${dataStr}</span>
                </div>
              </div>
              <div class="d-flex flex-column gap-1 flex-shrink-0">
                <button class="btn btn-sm btn-outline-light u-fs-075" onclick="editarArtigo('${escapeHtml(a.id)}')">Editar</button>
                <a href="artigo.html?id=${escapeHtml(a.id)}" target="_blank" class="btn btn-sm btn-outline-secondary u-fs-075">Ver</a>
                <button class="btn btn-sm btn-outline-danger u-fs-075" onclick="excluirArtigo('${escapeHtml(a.id)}')">Excluir</button>
              </div>
            </div>`;
        }).join('');

      } catch (error) {
        lista.innerHTML = `<p class="text-danger text-center py-3">Erro ao carregar: ${escapeHtml(error.message)}</p>`;
      }
    }

    async function editarArtigo(id) {
      try {
        const Artigo = Parse.Object.extend('Artigo');
        const query = new Parse.Query(Artigo);
        const artigo = await query.get(id);

        document.getElementById('artigo-id').value = id;
        document.getElementById('campo-titulo').value = artigo.get('titulo') || '';
        document.getElementById('campo-subtitulo').value = artigo.get('subtitulo') || '';
        document.getElementById('campo-categoria').value = artigo.get('categoria') || '';
        document.getElementById('campo-autor').value = artigo.get('autor') || 'Larissa Ember';
        document.getElementById('campo-conteudo').value = artigo.get('conteudo') || '';
        document.getElementById('campo-imagem').value = artigo.get('imagem') || '';
        document.getElementById('campo-tags').value = (artigo.get('tags') || []).join(', ');
        document.getElementById('campo-publicado').checked = !!artigo.get('publicado');

        const data = artigo.get('data') || artigo.createdAt;
        document.getElementById('campo-data').value = new Date(data).toISOString().split('T')[0];

        previewImagem();

        document.getElementById('form-titulo-header').textContent = '✏️ Editando Artigo';
        document.getElementById('btn-salvar').textContent = 'Atualizar Artigo';
        document.getElementById('btn-cancelar-edicao').style.display = 'inline-block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        mostrarToast('Erro ao carregar artigo: ' + error.message, 'erro');
      }
    }

    async function excluirArtigo(id) {
      const titulo = document.querySelector(`[onclick="editarArtigo('${id}')"]`)?.closest('.artigo-lista-item')?.querySelector('.info-titulo')?.textContent || 'este artigo';
      if (!confirm(`Tem certeza que deseja excluir "${titulo}"? Esta ação não pode ser desfeita.`)) return;

      try {
        const Artigo = Parse.Object.extend('Artigo');
        const query = new Parse.Query(Artigo);
        const artigo = await query.get(id);
        await artigo.destroy();
        mostrarToast('Artigo excluído.', 'sucesso');
        carregarListaArtigos();
      } catch (error) {
        mostrarToast('Erro ao excluir: ' + error.message, 'erro');
      }
    }

    // Verificar se já está autenticado via Parse session
    if (Parse.User.current()) {
      mostrarPainel();
    }
  
