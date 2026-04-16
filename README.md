# The Last Epiphany ✨

> *"Não importa seu símbolo, se faz sentido para quem criou, faz sentido para todes!"*

**The Last Epiphany** é o blog pessoal de Larissa Ember — técnica em logística, programadora e estudante de direito. O site reúne crônicas, artigos, projetos e um perfil social em um só lugar, contando a história da epifania de uma jovem mulher trans.

🌐 **Acesse em:** [lari-ember.github.io/epiphany](https://lari-ember.github.io/epiphany/)

---

## 📖 Seções

| Página | Descrição |
|---|---|
| [Home](index.html) | Página inicial com apresentação e acesso às seções |
| [Crônicas](comicas.html) | Compilado de crônicas — reinterpretações de acontecimentos reais |
| [Pokedex](projetos/pokedex.html) | Projeto interativo de Pokédex |
| [Perfil Social](profile.html) | Informações de contato e redes sociais |

### Crônicas publicadas

- **[Labutas de Uma Demigarota (parte 01)](labutas-de-uma-demigarota-01.html)** — De quando uma jovem sente disforia no seu dia a dia, e pede ajuda para si. *(03 de Agosto de 2022)*
- **[Garota Madsen em Monótonos Maravilha](garota-madsen-em-monótonos-maravilha.html)** — Uma metáfora sobre criação, pertencimento e inveja em um vilarejo de chamas coloridas. *(08 de Agosto de 2022)*

---

## 🛠️ Tecnologias

- **HTML5 & CSS3** — estrutura e estilização das páginas
- **[Bootstrap 4/5](https://getbootstrap.com/)** — componentes responsivos e grid
- **[PyScript](https://pyscript.net/)** *(experimental)* — experimentos com Python no browser
- **[Back4App / Parse](https://www.back4app.com/)** *(experimental)* — backend para persistência de dados

---

## 🗂️ Estrutura do projeto

```
epiphany/
├── index.html                              ← Página inicial
├── comicas.html                            ← Índice das crônicas
├── labutas-de-uma-demigarota-01.html       ← Crônica #1
├── garota-madsen-em-monótonos-maravilha.html ← Crônica #2
├── profile.html                            ← Perfil social
├── codex.html                              ← Experimentos com PyScript
├── css/
│   ├── more.css                            ← Estilos das crônicas e blog
│   ├── estilos.css                         ← Fontes (Playfair Display)
│   ├── product.css                         ← Estilos da página inicial
│   ├── pestilo.css                         ← Estilos do perfil social
│   ├── shared.css                          ← Classes utilitárias reutilizáveis
│   └── pages/                              ← CSS extraído de cada página HTML
├── js/
│   └── pages/                              ← JavaScript extraído de cada página HTML
├── images/                                 ← Imagens do site
└── projetos/
    └── pokedex.html                        ← Projeto Pokédex
```

---

## 🚀 Como rodar localmente

Não há dependências de build. Basta abrir qualquer arquivo `.html` diretamente no navegador:

```bash
# Clone o repositório
git clone https://github.com/lari-ember/epiphany.git
cd epiphany

# Abra a página inicial (Linux/macOS)
open index.html

# Ou use um servidor local simples (recomendado para evitar problemas de CORS)
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

---

## 👤 Autora

**Larissa Ember**
Transfem · Programadora · Estudante de Direito · Apaixonada por gatinhos 🐱

- GitHub: [@Lari-ember](https://github.com/Lari-ember)
- Instagram: [@lari.ember](https://www.instagram.com/lari.ember)
- Discord: [Servidor da Lari](https://discord.gg/jWzjDQSE)

---

## 📄 Licença

© Larissa Ember 2022. Todos os direitos reservados.
